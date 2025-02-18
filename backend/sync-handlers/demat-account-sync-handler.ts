import { format, isBefore } from 'date-fns';
import { Logger } from '../core/logger.js';
import { ISyncHandler } from './sync-handler.js';
import { DematAccount } from '../database/models/demat-account.js';
import fs from 'fs';
import path from 'path';
import { mfParam, rootDirectoryPath } from '../config.js';
import { ProcessorFactory } from '../processors/processor-factory.js';
import { simpleParser } from 'mailparser';
import { connection } from '../processors/mail-service.js';
import { PythonUtil } from '../utils/python-util.js';
import { stockTransactionListener } from '../singleton.js';
import { eventEmitter } from '../server.js';

const logger: Logger = new Logger('DematAccountSyncHandler');

export class DematAccountSyncHandler implements ISyncHandler<DematAccount> {
    sync(dematAccounts: DematAccount[], deltaSync: boolean): void {
        (async () => {
            for (let dematAccount of dematAccounts) {
                if (!dematAccount.broker) continue;
                let syncDate = deltaSync ? dematAccount.last_synced_on : dematAccount.start_date;
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
                        if (mailIds.length === 0) return;
                        stockTransactionListener.refresh(dematAccount.account_name);
                        let brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                        if (fs.existsSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName))) {
                            fs.rmSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                                recursive: true,
                                force: true
                            });
                        }
                        let processor = ProcessorFactory.getProcessor(dematAccount.broker.broker_email_id, undefined);
                        if (!processor) return;
                        const iFetch = connection.fetch(mailIds, {
                            bodies: ''
                        });
                        let mailProcessed = 0;
                        let parsedDataList: {
                            [key: string]: string;
                        }[] = [];
                        let continuationId = -1;
                        iFetch.on('message', function (msg, sequenceNumber) {
                            msg.once('body', function (stream, info) {
                                simpleParser(stream, async (error, parsedMail) => {
                                    if (error) {
                                        logger.error(error.message);
                                        return;
                                    }
                                    mailProcessed++;
                                    try {
                                        if (
                                            isBefore(
                                                parsedMail.date ? parsedMail.date : new Date(),
                                                dematAccount.last_synced_on
                                            )
                                        ) {
                                            return;
                                        }
                                        if (!parsedMail.text && !parsedMail.html) return;
                                        if (!parsedMail.from?.value[0].address) return;
                                        if (parsedMail.attachments.length > 0) {
                                            if (!processor) return;
                                            let tradeDate = processor.processMail(parsedMail, dematAccount);
                                            if (!tradeDate) return;
                                            let attachment = parsedMail.attachments[0];
                                            const buffer = Buffer.from(attachment.content);
                                            fs.mkdirSync(
                                                path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName),
                                                {
                                                    recursive: true
                                                }
                                            );
                                            let fileName = attachment.filename
                                                ? attachment.filename.replace(' ', '_').replace(' ', '_')
                                                : 'contract_note.pdf';
                                            const names: string[] = fileName.split('.');
                                            fileName = names[0] + '_' + format(tradeDate, 'dd-MM-yyyy');
                                            fs.writeFileSync(
                                                path.resolve(
                                                    rootDirectoryPath,
                                                    'reports',
                                                    brokerUniqueDirName,
                                                    `${fileName}.pdf`
                                                ),
                                                buffer
                                            );
                                            // Send to python container and wait for result
                                            let data: any = PythonUtil.runSync([
                                                brokerUniqueDirName,
                                                `${fileName}.pdf`,
                                                `${fileName}.json`,
                                                `${mfParam.panNo.toUpperCase()}`
                                            ]);
                                            let newData = data.replaceAll("'", '"');
                                            let currList: [{ [key: string]: string }] = JSON.parse(newData);
                                            parsedDataList.push(...currList);
                                            if (mailProcessed === mailIds.length) {
                                                eventEmitter.emit(dematAccount.account_name, {
                                                    account: dematAccount,
                                                    data: parsedDataList
                                                });
                                            }
                                        }
                                    } catch (Exception) {
                                        logger.error(
                                            `Unable to Process Contract Note for Account ${dematAccount.account_name}`
                                        );
                                    }
                                });
                            });
                        });
                        iFetch.on('error', (error) => {
                            logger.error(`Error while fetching contract note Mail ${error.message}`);
                        });
                        iFetch.on('end', () => {
                            logger.debug(`All mails has been read for ${dematAccount.account_name}`);
                        });
                    }
                );
            }
        })();
    }
}
