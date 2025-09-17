import { Account } from '../database/models/account.js';
import { simpleParser } from 'mailparser';
import { AsyncExceptionHandler } from '../core/async-handler.js';
import { AccountTransaction } from '../database/models/account-transaction.js';
import { Logger } from '../core/logger.js';
import { IProcessor, ProcessorFactory } from '../processors/processor-factory.js';
import { compositeMailService } from '../processors/composite-mail-service.js';

// Create a new logger instance.
const logger = new Logger('CommonAccountTransactionSyncHandler');

/**
 * This class handles the synchronization of account transactions from email.
 * It fetches emails based on a given criteria, parses them, and then uses a processor to extract the transaction information.
 */
export class CommonAccountTransactionSyncHandler {
    /**
     * This method syncs transactions for a single account.
     * @param criteria The criteria to use for searching emails.
     * @param account The account to sync transactions for.
     * @param handleTransaction A callback function to handle the extracted transaction.
     */
    syncSingle(criteria: any[], account: Account, handleTransaction: (transaction: AccountTransaction) => void): any {
        logger.info(`Mail Search: Criteria: ${criteria}, Account: ${account.account_name}`);
        let bank = account.bank;
        const connection = compositeMailService.getConnection(account.associated_email);
        if (!connection) return;
        // Search for emails based on the given criteria.
        connection.search(criteria, (error, mailIds) => {
            if (error) {
                logger.error(error.message);
                return;
            }
            logger.info(
                `Mail Search: Criteria: ${criteria}, Account: ${account.account_name}, Found: ${mailIds.length}`
            );
            if (mailIds.length === 0) return;
            // Fetch the emails.
            const iFetch = connection.seq.fetch(mailIds, {
                bodies: ''
            });
            iFetch.on('message', function (msg, sequenceNumber) {
                msg.once('body', function (stream, info) {
                    // Parse the email.
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
                            // Get the processor for the bank.
                            const bankProcessor: IProcessor<any, any> | undefined = ProcessorFactory.getProcessor(
                                bank.alert_email_id,
                                undefined
                            );

                            if (!bankProcessor) return;
                            // Process the email to extract the transaction.
                            const transaction = bankProcessor.processForAccount(parsedMail, account);
                            if (!transaction) return;
                            // Handle the extracted transaction.
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
