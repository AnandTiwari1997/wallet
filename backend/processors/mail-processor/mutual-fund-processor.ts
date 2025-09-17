/**
 * @file This file contains the implementation of the MutualFundProcessor class, which is responsible for processing mutual fund-related emails.
 */
import { IAnonymousProcessor } from '../processor-factory.js';
import { ParsedMail } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { rootDirectoryPath } from '../../server.js';
import { mfParam } from '../../config.js';
import { mutualFundRepository } from '../../database/repository/mutual-fund-repository.js';
import { MutualFundTransaction } from '../../database/models/mutual-fund-transaction.js';
import { RepositoryUtils } from '../../database/util/repository-utils.js';
import { syncTrackerStorage } from '../../database/repository/sync-tracker-storage.js';
import { Logger } from '../../core/logger.js';
import { PythonUtil } from '../../utils/python-util.js';

const logger: Logger = new Logger('MutualFundProcessor');

/**
 * @class MutualFundProcessor
 * @description This class implements the IAnonymousProcessor interface and is responsible for processing mutual fund-related emails.
 */
export class MutualFundProcessor implements IAnonymousProcessor {
    /**
     * @description This method downloads the attachment from the parsed mail.
     * @param parsedMail The parsed mail object.
     * @returns The name of the downloaded file.
     */
    private downloadAttachment(parsedMail: ParsedMail) {
        let attachment = parsedMail.attachments[0];
        const buffer = Buffer.from(attachment.content);
        const mutualFundDir = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund');
        fs.mkdirSync(mutualFundDir, { recursive: true });
        const fileName = attachment.filename ? attachment.filename : 'anand_tiwari_mutual_fund';
        const pdfFile = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund', `${fileName}.pdf`);
        fs.writeFileSync(pdfFile, buffer);
        return fileName;
    }

    /**
     * @description This method processes the parsed mail and extracts the mutual fund transactions.
     * @param parsedMail The parsed mail object.
     */
    process(parsedMail: ParsedMail): any {
        // Check if are we waiting for mail from CAMS
        // If Yes Process the mail
        // If NO, ignore this mail
        if (parsedMail.attachments.length > 0) {
            const fileName = this.downloadAttachment(parsedMail);
            PythonUtil.run(
                ['mutual_fund', `${fileName}.pdf`, `${fileName}.json`, `${mfParam.password}`],
                async (data: any) => {
                    // TODO: fix explicit replace operation.
                    let newData = data.replaceAll("'", '"');
                    const parsedData: MutualFundTransaction[] = JSON.parse(newData);
                    // removing all data, as we will reinsert data from the beginning to maintain consistency.
                    await mutualFundRepository.delete({});
                    for (let parseData of parsedData) {
                        let mutualFund = parseData;
                        let id = RepositoryUtils.generateMutualFundTransactionId(mutualFund);
                        let mfTransaction = await mutualFundRepository.findOne({
                            where: {
                                transaction_id: id
                            }
                        });
                        if (!mfTransaction) {
                            mutualFund.transaction_id = id;
                            await mutualFundRepository.save(mutualFund);
                        } else {
                            mfTransaction.amount = mfTransaction.amount + mutualFund.amount;
                            mfTransaction.units = mfTransaction.units + mutualFund.units;
                            await mutualFundRepository.update(id, mfTransaction);
                        }
                    }
                    const syncTracker = syncTrackerStorage.get('mutual_fund');
                    if (!syncTracker) return;
                    syncTracker.status = 'COMPLETED';
                    syncTracker.endTime = new Date();
                    syncTrackerStorage.update(syncTracker);
                },
                (data) => {
                    logger.error('ERROR:', data);
                }
            );
        }
    }

    /**
     * @description This method is not implemented yet.
     * @param parsedMail The parsed mail object.
     * @param anyParam Any parameter.
     */
    processForAccount(parsedMail: ParsedMail, anyParam: any): any {
        return;
    }
}
