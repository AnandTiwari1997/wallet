import { format, isBefore } from 'date-fns';
import { Logger } from '../core/logger.js';
import { ISyncHandler } from './sync-handler.js';
import { DematAccount } from '../database/models/demat-account.js';
import fs from 'fs';
import path from 'path';
import { mfParam, rootDirectoryPath } from '../config.js';
import { ProcessorFactory } from '../processors/processor-factory.js';
import { simpleParser } from 'mailparser';
import { PythonUtil } from '../utils/python-util.js';
import { stockTransactionListener } from '../singleton.js';
import { StockTransaction } from '../database/models/stock-transaction.js';
import { eventEmitter } from '../server.js';
import { compositeMailService } from '../processors/composite-mail-service.js';

const logger: Logger = new Logger('DematAccountSyncHandler');

/**
 * Handles the synchronization of stock transactions for demat accounts.
 */
export class DematAccountSyncHandler implements ISyncHandler<DematAccount> {
    /**
     * Synchronizes stock transaction data for the given demat accounts.
     * @param dematAccounts - The list of demat accounts to sync.
     * @param deltaSync - Whether to perform a delta sync (only new data) or a full sync.
     */
    sync(dematAccounts: DematAccount[], deltaSync: boolean): void {
        (async () => {
            for (let dematAccount of dematAccounts) {
                // Skip accounts without a broker.
                if (!dematAccount.broker) continue;

                // Determine the sync date based on whether it's a delta sync.
                let syncDate = deltaSync ? dematAccount.last_synced_on : dematAccount.start_date;

                const connection = compositeMailService.getConnection(dematAccount.associated_email);
                if (!connection) continue;

                // Search for contract note emails from the broker since the last sync date.
                connection.search(
                    [
                        ['SINCE', syncDate],
                        ['HEADER', 'FROM', dematAccount.broker.broker_email_id],
                        ['SUBJECT', 'CONTRACT NOTE']
                    ],
                    (error, mailIds) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }

                        // If no new mails, nothing to do.
                        if (mailIds.length === 0) return;

                        // Refresh the listener for this account to prepare for new transactions.
                        stockTransactionListener.refresh(dematAccount.account_bo_id);

                        // Define a unique directory for this broker's reports.
                        const brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                        const brokerReportPath = path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName);

                        // Clean up any old report files for this broker to ensure a fresh start.
                        if (fs.existsSync(brokerReportPath)) {
                            fs.rmSync(brokerReportPath, { recursive: true, force: true });
                        }
                        fs.mkdirSync(brokerReportPath, { recursive: true });

                        // Get the appropriate processor for the broker.
                        let processor = ProcessorFactory.getProcessor(dematAccount.broker.broker_email_id, undefined);
                        if (!processor) return;

                        // Fetch the full email bodies.
                        const iFetch = connection.seq.fetch(mailIds, {
                            bodies: ''
                        });

                        const messagePromises: Promise<StockTransaction[] | []>[] = [];

                        // Process each fetched email.
                        iFetch.on('message', function (msg, sequenceNumber) {
                            const promise = new Promise<StockTransaction[] | []>((resolve, reject) => {
                                msg.once('body', function (stream, info) {
                                    simpleParser(stream, async (error, parsedMail) => {
                                        if (error) {
                                            logger.error(error.message);
                                            reject(error);
                                            return;
                                        }
                                        try {
                                            // Basic validation to skip irrelevant emails.
                                            if (
                                                isBefore(
                                                    parsedMail.date ? parsedMail.date : new Date(),
                                                    dematAccount.last_synced_on
                                                ) ||
                                                (!parsedMail.text && !parsedMail.html) ||
                                                !parsedMail.from?.value[0].address ||
                                                parsedMail.attachments.length == 0 ||
                                                !processor
                                            ) {
                                                resolve([]);
                                                return;
                                            }

                                            // Process the email to get the trade date.
                                            let tradeDate = processor.processForAccount(parsedMail, dematAccount);
                                            if (!tradeDate) {
                                                resolve([]);
                                                return;
                                            }

                                            // Get the first attachment (usually the contract note PDF).
                                            let attachment = parsedMail.attachments[0];
                                            const buffer = Buffer.from(attachment.content);

                                            // Sanitize the original filename and create a unique name with the trade date.
                                            const originalFileName =
                                                attachment.filename?.replace(/ /g, '_') || 'contract_note.pdf';
                                            const fileExtension = path.extname(originalFileName);
                                            const baseName = path.basename(originalFileName, fileExtension);
                                            const fileName = `${baseName}_${format(tradeDate, 'dd-MM-yyyy')}`;
                                            const pdfFilePath = path.join(brokerReportPath, `${fileName}.pdf`);

                                            // Write the attachment to a file.
                                            fs.writeFileSync(pdfFilePath, buffer);

                                            // Run a Python script to parse the PDF and extract transaction data.
                                            let data: any = PythonUtil.runSync([
                                                brokerUniqueDirName,
                                                `${fileName}.pdf`,
                                                `${fileName}.json`,
                                                `${mfParam.panNo.toUpperCase()}`
                                            ]);

                                            // The python script returns a string that needs to be parsed as JSON.
                                            let newData = data.replaceAll("'", '"');
                                            resolve(JSON.parse(newData));
                                        } catch (Exception) {
                                            logger.error(
                                                `Unable to Process Contract Note for Account ${dematAccount.account_name}`
                                            );
                                            reject(
                                                `Unable to Process Contract Note for Account ${dematAccount.account_name}`
                                            );
                                        }
                                    });
                                });
                            });
                            messagePromises.push(promise);
                        });

                        iFetch.on('error', (error) => {
                            logger.error(`Error while fetching contract note Mail ${error.message}`);
                        });

                        // After all messages are processed.
                        iFetch.on('end', async () => {
                            logger.debug(`All mails has been read for ${dematAccount.account_name}`);
                            try {
                                // Wait for all parsing promises to complete and flatten the array of transactions.
                                const allStockTransactions = (await Promise.all(messagePromises)).flat();
                                // Emit an event with the new transactions for this account.
                                eventEmitter.emit(dematAccount.account_bo_id, {
                                    account: dematAccount,
                                    ata: allStockTransactions
                                });
                            } catch (e) {
                                logger.error(`Error while syncing demat account ${e}`);
                            }
                        });
                    }
                );
            }
        })();
    }
}
