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

const logger: Logger = new Logger('ContractNoteProcessor');

export abstract class ContractNoteProcessor implements IContractNoteProcessor {
    process(parsedMail: ParsedMail): any {
        let from = parsedMail.from;
        if (!from || !from.value || !from.value[0].address) return;
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
                stockTransactionListener.refresh(dematAccount.account_name);
                let brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                if (fs.existsSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName))) {
                    fs.rmSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                        recursive: true,
                        force: true
                    });
                }
                if (parsedMail.attachments.length > 0) {
                    let tradeDate = this.processMail(parsedMail, dematAccount);
                    if (!tradeDate) return;
                    let attachment = parsedMail.attachments[0];
                    const buffer = Buffer.from(attachment.content);
                    fs.mkdirSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                        recursive: true
                    });
                    let fileName = attachment.filename
                        ? attachment.filename.replace(' ', '_').replace(' ', '_')
                        : 'contract_note.pdf';
                    const names: string[] = fileName.split('.');
                    fileName = names[0] + '_' + format(tradeDate, 'dd-MM-yyyy');
                    fs.writeFileSync(
                        path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName, `${fileName}.pdf`),
                        buffer
                    );
                    let data: any = PythonUtil.runSync([
                        brokerUniqueDirName,
                        `${fileName}.pdf`,
                        `${fileName}.json`,
                        `${mfParam.panNo.toUpperCase()}`
                    ]);
                    let newData = data.replaceAll("'", '"');
                    const parsedData: {
                        [key: string]: string;
                    }[] = JSON.parse(newData);
                    eventEmitter.emit('stock', ['start', dematAccount]);
                    eventEmitter.emit('stock', parsedData);
                    eventEmitter.emit('stock', ['end', dematAccount]);
                }
            });
    }

    processMail(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        return undefined;
    }
}
