/**
 * This file contains the base class for processing contract notes.
 * It defines the common logic for handling email attachments,
 * interacting with the database, and invoking a Python script for further processing.
 */
import { IContractNoteProcessor } from '../../processor-factory.js';
import { ParsedMail } from 'mailparser';
import { DematAccount } from '../../../database/models/demat-account.js';
import { dematAccountRepository } from '../../../database/repository/demat-account-repository.js';
import fs from 'fs';
import path from 'path';
import { eventEmitter, rootDirectoryPath } from '../../../server.js';
import { format } from 'date-fns';
import { mfParam } from '../../../config.js';
import { PythonUtil } from '../../../utils/python-util.js';
import { Logger } from '../../../core/logger.js';
import { stockTransactionListener } from '../../../singleton.js';
import { StockTransaction } from '../../../database/models/stock-transaction.js';

const logger: Logger = new Logger('ContractNoteProcessor');

/**
 * Abstract base class for processing contract notes from different brokers.
 * This class provides the core functionality to process an email, extract attachments,
 * and trigger the stock transaction processing pipeline.
 */
export abstract class ContractNoteProcessor implements IContractNoteProcessor {
    /**
     * @description This method downloads the attachment from the parsed mail.
     * @param parsedMail The parsed mail object.
     * @param brokerReportPath
     * @param tradeDate
     * @returns The name of the downloaded file.
     */
    private downloadAttachment(parsedMail: ParsedMail, brokerReportPath: string, tradeDate: Date) {
        let attachment = parsedMail.attachments[0];
        const buffer = Buffer.from(attachment.content);

        // Sanitize the original filename and create a unique name with the trade date.
        // Use a global regex to replace all spaces. Use path module for robustness.
        const originalFileName = attachment.filename?.replace(/ /g, '_') || 'contract_note.pdf';
        const fileExtension = path.extname(originalFileName);
        const baseName = path.basename(originalFileName, fileExtension);
        const fileName = `${baseName}_${format(tradeDate, 'dd-MM-yyyy')}`;
        const pdfFilePath = path.join(brokerReportPath, `${fileName}.pdf`);

        // Write the attachment to a file.
        fs.writeFileSync(pdfFilePath, buffer);
        return fileName;
    }

    /**
     * Processes the incoming parsed email.
     * This is the main entry point for the contract note processing logic.
     * It identifies the sender, retrieves the corresponding demat account,
     * saves the email attachment, and triggers a Python script to parse the contract note.
     * Finally, it emits events to signal the completion of the process.
     * @param parsedMail The parsed email object.
     */
    process(parsedMail: ParsedMail): any {
        let from = parsedMail.from;
        if (!from || !from.value || !from.value[0].address) return;

        // Find the demat account associated with the sender's email address.
        dematAccountRepository
            .findOne({
                where: {
                    broker: {
                        broker_email_id: from.value[0].address
                    }
                }
            })
            .then((dematAccount) => {
                if (!dematAccount) return;

                logger.info(
                    `Mail From: ${parsedMail.from?.text} Subject: ${parsedMail.subject} Account: ${dematAccount.account_name}`
                );

                if (parsedMail.attachments.length == 0) {
                    return;
                }

                // Process the email for the specific account to get the trade date.
                let tradeDate = this.processForAccount(parsedMail, dematAccount);
                if (!tradeDate) {
                    logger.error('Could not determine trade date from email. Skipping.', {
                        subject: parsedMail.subject
                    });
                    return;
                }

                // Notify listener to refresh transactions for this account before adding new ones.
                stockTransactionListener.refresh(dematAccount.account_bo_id);

                // Define paths once to avoid repetition.
                const brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                const brokerReportPath = path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName);

                // Clean up any old report files for this broker to ensure a fresh start.
                if (fs.existsSync(brokerReportPath)) {
                    fs.rmSync(brokerReportPath, { recursive: true, force: true });
                }
                fs.mkdirSync(brokerReportPath, { recursive: true });

                // Download the attachment from the parsed email.
                const fileName = this.downloadAttachment(parsedMail, brokerReportPath, tradeDate);

                // Run a Python script to process the contract note.
                let data: any = PythonUtil.runSync([
                    brokerUniqueDirName,
                    `${fileName}.pdf`,
                    `${fileName}.json`,
                    `${mfParam.panNo.toUpperCase()}`
                ]);

                // Parse the data returned from the Python script.
                let newData = data.replaceAll("'", '"');
                const parsedData: StockTransaction[] = JSON.parse(newData);

                // Emit events to signal the start and end of stock processing.
                eventEmitter.emit(dematAccount.account_bo_id, { account: dematAccount, data: parsedData });
            });
    }

    /**
     * Abstract method to be implemented by subclasses.
     * This method should contain broker-specific logic to extract the trade date from the email.
     * For example, some brokers might include the trade date in the email subject,
     * while others might have it in the email body.
     * @param parsedMail The parsed email object.
     * @param dematAccount The demat account associated with the email.
     * @returns The trade date, or undefined if it cannot be determined.
     */
    processForAccount(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        return undefined;
    }
}
