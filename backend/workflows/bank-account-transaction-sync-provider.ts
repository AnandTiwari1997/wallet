import { SyncProvider } from '../models/sync-provider.js';
import { connection, eventEmitter } from './mail-service.js';
import { simpleParser } from 'mailparser';
import { accountStorage } from '../storage/account-storage.js';
import { bankStorage } from '../storage/bank-storage.js';
import { Logger } from '../logger/logger.js';
import { accountTransactionStorage } from '../storage/account-transaction-storage.js';
import { startOfYear, subYears } from 'date-fns';
import { BankProcessor, BankProcessorFactory } from './processor/bank-processor.js';
import { Account } from '../models/account.js';

const logger: Logger = new Logger('BankAccountTransactionSyncProvider');

export class BankAccountTransactionSyncProvider implements SyncProvider {
    sync(): void {
        eventEmitter.on('mail', (args) => {
            console.log(args);
            const mails: { numberOfNewMails: number; totalMails: number } = args;
            const iFetch = connection.seq.fetch(`${Math.abs(mails.totalMails - mails.numberOfNewMails)}:${mails.totalMails}`, {
                bodies: ''
            });
            iFetch.on('message', function (msg, sequenceNumber) {
                msg.once('body', function (stream, info) {
                    simpleParser(stream, async (error, parsedMail) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (!parsedMail.text) return;
                        if (!parsedMail.from?.value[0].address) return;
                        bankStorage
                            .findAll({
                                filters: [
                                    {
                                        key: 'alert_email_id',
                                        value: parsedMail.from?.value[0].address
                                    }
                                ]
                            })
                            .then((banks) => {
                                if (!banks) return;
                                if (banks.length === 0) return;
                                let bank = banks[0];
                                const bankProcessor = BankProcessorFactory.getProcessor(bank.alert_email_id);
                                if (bankProcessor) {
                                    const transaction = bankProcessor.process(parsedMail);
                                    if (transaction) {
                                        accountStorage
                                            .findAll({
                                                filters: [{ key: 'bank', value: `${bank.id}` }]
                                            })
                                            .then((accounts) => {
                                                accounts.forEach((account) => {
                                                    transaction.account = account.id;
                                                    accountTransactionStorage.add(transaction).then((updatedTransaction) => {
                                                        if (updatedTransaction) {
                                                            account.last_synced_on = new Date();
                                                            accountStorage.update(account);
                                                        }
                                                    });
                                                });
                                            });
                                    }
                                }
                            });
                    });
                });
            });
            iFetch.on('error', (error) => {
                logger.error(`Error On Processing Mail ${error.message}`);
            });
            iFetch.on('end', () => {
                logger.info(`Message has been processed`);
            });
        });
    }

    syncInitial(accounts: Account[], deltaSync: boolean) {
        accounts.forEach((account) => {
            bankStorage.find(account.bank).then((bank) => {
                if (!bank) return;
                let syncDate = deltaSync ? account.last_synced_on : subYears(startOfYear(new Date()), 3);
                connection.search(
                    [
                        ['SINCE', syncDate],
                        ['FROM', bank.alert_email_id]
                    ],
                    (error, uids) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        const iFetch = connection.seq.fetch(uids, {
                            bodies: ''
                        });
                        iFetch.on('message', function (msg, sequenceNumber) {
                            msg.once('body', function (stream, info) {
                                simpleParser(stream, async (error, parsedMail) => {
                                    if (error) {
                                        logger.error(error.message);
                                        return;
                                    }
                                    if (!parsedMail.text) return;
                                    if (!parsedMail.from?.value[0].address) return;
                                    if (!account.bank) return;
                                    const bankProcessor: BankProcessor | undefined = BankProcessorFactory.getProcessor(bank.alert_email_id);
                                    if (bankProcessor) {
                                        const transaction = bankProcessor.process(parsedMail);
                                        if (transaction) {
                                            transaction.account = account.id;
                                            accountTransactionStorage.add(transaction).then((updatedTransaction) => {
                                                if (updatedTransaction) {
                                                    account.last_synced_on = new Date();
                                                    accountStorage.update(account);
                                                }
                                            });
                                        }
                                    }
                                });
                            });
                        });
                        iFetch.on('error', (error) => {
                            logger.error(`Error On Processing Mail ${error.message}`);
                        });
                        iFetch.on('end', () => {
                            logger.info(`Message has been processed`);
                        });
                    }
                );
            });
        });
    }
}
