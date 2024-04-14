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

export class MutualFundProcessor implements IAnonymousProcessor {
    process(parsedMail: ParsedMail): any {
        // Check if are we waiting for mail from CAMS
        // If Yes Process the mail
        // If NO, ignore this mail
        if (parsedMail.attachments.length > 0) {
            let attachment = parsedMail.attachments[0];
            const buffer = Buffer.from(attachment.content);
            fs.mkdirSync(path.resolve(rootDirectoryPath, 'reports', 'mutual_fund'), {
                recursive: true
            });
            const fileName = attachment.filename ? attachment.filename : 'anand_tiwari_mutual_fund';
            fs.writeFileSync(path.resolve(rootDirectoryPath, 'reports', 'mutual_fund', `${fileName}.pdf`), buffer);
            PythonUtil.run(
                ['mutual_fund', `${fileName}.pdf`, `${fileName}.json`, `${mfParam.password}`],
                async (data: any) => {
                    let newData = data.replaceAll("'", '"');
                    const parsedData: {
                        [key: string]: string;
                    }[] = JSON.parse(newData);
                    await mutualFundRepository.delete({});
                    for (let parseData of parsedData) {
                        let mutualFund = Object.assign(MutualFundTransaction.prototype, parseData);
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

    processMail(parsedMail: ParsedMail, anyParam: any): any {
        return;
    }
}
