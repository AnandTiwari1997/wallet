import { ParsedMail } from 'mailparser';
import { Account } from '../../../database/models/account.js';
import { AccountTransaction, TransactionType } from '../../../database/models/account-transaction.js';
import { IBankProcessor } from '../../processor-factory.js';
import { bankRepository } from '../../../database/repository/bank-repository.js';
import { accountRepository } from '../../../database/repository/account-repository.js';
import { RepositoryUtils } from '../../../database/util/repository-utils.js';
import { accountTransactionRepository } from '../../../database/repository/account-transaction-repository.js';
import { Logger } from '../../../core/logger.js';

const logger: Logger = new Logger('BankProcessor');

export abstract class BankProcessor implements IBankProcessor {
    process(parsedMail: ParsedMail): void | any | undefined {
        bankRepository
            .find({
                where: {
                    alert_email_id: parsedMail.from?.value[0].address
                }
            })
            .then((banks) => {
                if (!banks) return;
                if (banks.length === 0) return;
                let bank = banks[0];
                accountRepository
                    .find({
                        relations: {
                            bank: true
                        },
                        where: {
                            bank_id: bank.bank_id,
                            account_type: 'BANK'
                        }
                    })
                    .then((accounts) => {
                        accounts.forEach((account) => {
                            logger.info(
                                `Mail - From: ${parsedMail.from?.value[0].address}, Subject: ${parsedMail.subject}, Account: ${account.account_name}`
                            );
                            const transaction = this.processMail(parsedMail, account);
                            if (!transaction) return;
                            transaction.account = account;
                            let id = RepositoryUtils.generateAccountTransactionId(transaction);
                            accountTransactionRepository
                                .find({
                                    relations: {
                                        account: true
                                    },
                                    where: {
                                        transaction_id: id
                                    }
                                })
                                .then((value) => {
                                    if (!value) {
                                        accountTransactionRepository.save(transaction).then((updatedTransaction) => {
                                            if (updatedTransaction) {
                                                account.last_synced_on = new Date();
                                                account.account_balance =
                                                    account.account_balance +
                                                    (updatedTransaction.transaction_type === TransactionType.INCOME
                                                        ? 1
                                                        : -1) *
                                                        updatedTransaction.amount;
                                                accountRepository.update(account.account_id, account).then((r) => {});
                                            }
                                        });
                                    }
                                });
                        });
                    });
            });
    }

    getAccountNumber(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getAmount(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getDate(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getDescription(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getMailText(parsedMail: ParsedMail, onText: (text: string) => string | undefined): string {
        return '';
    }

    processMail(parsedMail: ParsedMail, account: Account): AccountTransaction | undefined {
        return undefined;
    }
}
