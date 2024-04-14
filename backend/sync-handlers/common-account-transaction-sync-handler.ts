import { Account } from '../database/models/account.js';
import { connection } from '../processors/mail-service.js';
import { simpleParser } from 'mailparser';
import { AsyncExceptionHandler } from '../core/async-handler.js';
import { AccountTransaction } from '../database/models/account-transaction.js';
import { Logger } from '../core/logger.js';
import { IProcessor, ProcessorFactory } from '../processors/processor-factory.js';

const logger = new Logger('CommonAccountTransactionSyncHandler');

export class CommonAccountTransactionSyncHandler {
    syncSingle(criteria: any[], account: Account, handleTransaction: (transaction: AccountTransaction) => void): any {
        logger.info(`Mail Search: Criteria: ${criteria}, Account: ${account.account_name}`);
        let bank = account.bank;
        connection.search(criteria, (error, mailIds) => {
            if (error) {
                logger.error(error.message);
                return;
            }
            logger.info(
                `Mail Search: Criteria: ${criteria}, Account: ${account.account_name}, Found: ${mailIds.length}`
            );
            if (mailIds.length === 0) return;
            const iFetch = connection.fetch(mailIds, {
                bodies: ''
            });
            iFetch.on('message', function (msg, sequenceNumber) {
                msg.once('body', function (stream, info) {
                    simpleParser(
                        stream,
                        {
                            skipImageLinks: true,
                            skipTextLinks: true,
                            skipHtmlToText: false,
                            skipTextToHtml: true,
                            keepCidLinks: false,
                            decodeStrings: true
                        },
                        AsyncExceptionHandler(async (error, parsedMail) => {
                            if (error) {
                                logger.error(error);
                                return;
                            }
                            if (!parsedMail.text && !parsedMail.html) return;
                            if (!parsedMail.from?.value[0].address) return;
                            logger.info(
                                `Mail - From: ${parsedMail.from?.value[0].address}, Subject: ${parsedMail.subject}, Account: ${account.account_name}`
                            );
                            const bankProcessor: IProcessor<any, any> | undefined = ProcessorFactory.getProcessor(
                                bank.alert_email_id,
                                undefined
                            );

                            if (!bankProcessor) return;
                            const transaction = bankProcessor.processMail(parsedMail, account);
                            if (!transaction) return;
                            handleTransaction(transaction);
                        })
                    );
                });
            });
            iFetch.on('error', (error) => {
                logger.error(`Error On Processing Mail ${error.message}`);
            });
            iFetch.on('end', () => {
                logger.info(`All mails has been read for ${account.account_name}`);
            });
        });
    }
}
