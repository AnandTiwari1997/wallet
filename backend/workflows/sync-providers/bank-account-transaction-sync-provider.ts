import { SyncProvider } from './sync-provider.js';
import { connection, eventEmitter } from '../mail-service.js';
import { simpleParser } from 'mailparser';
import { accountRepository } from '../../database/repository/account-repository.js';
import { bankRepository } from '../../database/repository/bank-repository.js';
import { Logger } from '../../core/logger.js';
import { accountTransactionRepository } from '../../database/repository/account-transaction-repository.js';
import { startOfYear, subYears } from 'date-fns';
import { BankProcessor, BankProcessorFactory } from '../processor/processors.js';
import { Account } from '../../database/models/account.js';
import { TransactionType } from '../../database/models/account-transaction.js';

const logger: Logger = new Logger('BankAccountTransactionSyncProvider');

export class BankAccountTransactionSyncProvider implements SyncProvider<Account> {
    sync(): void {
        eventEmitter.on('mail', (args) => {
            logger.info(args);
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
                        bankRepository
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
                                    accountRepository
                                        .findAll({
                                            filters: [
                                                { key: 'bank', value: `${bank.bank_id}` },
                                                {
                                                    key: 'account_type',
                                                    value: 'BANK'
                                                }
                                            ]
                                        })
                                        .then((accounts) => {
                                            accounts.forEach((account) => {
                                                const transaction = bankProcessor.process(parsedMail, account);
                                                if (transaction) {
                                                    transaction.account = account;
                                                    let id = accountTransactionRepository.generateId(transaction);
                                                    accountTransactionRepository.find(id).then((value) => {
                                                        if (!value) {
                                                            accountTransactionRepository.add(transaction).then((updatedTransaction) => {
                                                                if (updatedTransaction) {
                                                                    account.last_synced_on = new Date();
                                                                    account.account_balance =
                                                                        account.account_balance + (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) * updatedTransaction.amount;
                                                                    accountRepository.update(account);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
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

    manualSync(accounts: Account[], deltaSync: boolean) {
        (async () => {
            accounts.forEach((account) => {
                if (account.account_type !== 'BANK') return;
                if (!account.bank) return;
                bankRepository.find(account.bank?.bank_id).then((bank) => {
                    if (!bank) return;
                    let syncDate = deltaSync ? account.last_synced_on : subYears(startOfYear(new Date()), 3);
                    connection.search(
                        [
                            ['SINCE', syncDate],
                            ['HEADER', 'FROM', bank.alert_email_id]
                        ],
                        (error, uids) => {
                            if (error) {
                                logger.error(error.message);
                                return;
                            }
                            if (uids.length === 0) return;
                            const iFetch = connection.fetch(uids, {
                                bodies: ''
                            });
                            iFetch.on('message', function (msg, sequenceNumber) {
                                msg.once('body', function (stream, info) {
                                    simpleParser(stream, async (error, parsedMail) => {
                                        if (error) {
                                            logger.error(error.message);
                                            return;
                                        }
                                        if (!parsedMail.text && !parsedMail.html) return;
                                        if (!parsedMail.from?.value[0].address) return;
                                        const bankProcessor: BankProcessor | undefined = BankProcessorFactory.getProcessor(bank.alert_email_id);
                                        if (bankProcessor) {
                                            const transaction = bankProcessor.process(parsedMail, account);
                                            if (transaction) {
                                                transaction.account = account;
                                                let id = accountTransactionRepository.generateId(transaction);
                                                accountTransactionRepository.find(id).then((value) => {
                                                    if (!value) {
                                                        accountTransactionRepository.add(transaction).then((updatedTransaction) => {
                                                            if (updatedTransaction) {
                                                                account.last_synced_on = new Date();
                                                                account.account_balance =
                                                                    account.account_balance + (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) * updatedTransaction.amount;
                                                                accountRepository.update(account);
                                                            }
                                                        });
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
        })();
    }
}

export const bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
bankAccountTransactionSyncProvider.sync();
