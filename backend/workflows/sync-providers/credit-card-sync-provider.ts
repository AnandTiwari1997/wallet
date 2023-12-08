import { SyncProvider } from './sync-provider.js';
import { connection, eventEmitter } from '../mail-service.js';
import { simpleParser } from 'mailparser';
import { accountRepository } from '../../database/repository/account-repository.js';
import { accountTransactionRepository } from '../../database/repository/account-transaction-repository.js';
import { Logger } from '../../core/logger.js';
import { BankProcessor, BankProcessorFactory } from '../processor/processors.js';
import { Account } from '../../database/models/account.js';
import { bankRepository } from '../../database/repository/bank-repository.js';
import { TransactionType } from '../../database/models/account-transaction.js';

const logger = new Logger('CreditCardSyncProvider');

export class CreditCardSyncProvider implements SyncProvider<Account> {
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
                            return;
                        }
                        if (!parsedMail.text) return;
                        if (!parsedMail.from?.value[0].address) return;
                        accountRepository
                            .findAll({
                                filters: [{ key: 'accountType', value: `CREDIT_CARD` }]
                            })
                            .then((accounts) => {
                                accounts.forEach((account) => {
                                    let alertEmailId = account.bank?.alert_email_id;
                                    if (alertEmailId) {
                                        const bankProcessor: BankProcessor | undefined = BankProcessorFactory.getProcessor(alertEmailId);
                                        if (!bankProcessor) return;
                                        const transaction = bankProcessor.process(parsedMail, account);
                                        if (!transaction) return;
                                        transaction.account = account;
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

    manualSync(accounts: Account[], deltaSync: boolean): void {
        (async () => {
            accounts.forEach((account) => {
                if (account.account_type !== 'CREDIT_CARD') return;
                if (!account.bank) return;
                bankRepository.find(account.bank?.bank_id).then((bank) => {
                    if (!bank) return;
                    let syncDate = deltaSync ? account.last_synced_on : account.start_date;
                    connection.search(
                        [
                            ['SINCE', syncDate],
                            ['BODY', account.search_text]
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
                                        if (!bankProcessor) return;
                                        const transaction = bankProcessor.process(parsedMail, account);
                                        if (!transaction) return;
                                        transaction.account = account;
                                        accountTransactionRepository.add(transaction).then((updatedTransaction) => {
                                            if (updatedTransaction) {
                                                account.last_synced_on = new Date();
                                                if (deltaSync) {
                                                    account.account_balance =
                                                        account.account_balance + (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) * updatedTransaction.amount;
                                                }
                                                accountRepository.update(account);
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
                        }
                    );
                });
            });
        })();
    }
}

export const creditCardSyncProvider = new CreditCardSyncProvider();
