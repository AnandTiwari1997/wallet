import { startOfYear, subYears } from 'date-fns';
import { ISyncHandler } from './sync-handler.js';
import { Logger } from '../core/logger.js';
import { Account } from '../database/models/account.js';
import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { TransactionType } from '../database/models/account-transaction.js';
import { commonAccountTransactionSyncHandler } from '../singleton.js';

const logger: Logger = new Logger('BankAccountTransactionSyncHandler');

export class BankAccountTransactionSyncHandler implements ISyncHandler<Account> {
    sync(accounts: Account[], deltaSync: boolean) {
        (async () => {
            logger.info(
                `Syncing has been started for following bank accounts`,
                accounts.map((account) => account.account_name)
            );
            accounts.forEach((account) => {
                if (account.account_type !== 'BANK') return;
                if (!account.bank) return;
                let syncDate = deltaSync ? account.last_synced_on : subYears(startOfYear(new Date()), 3);
                commonAccountTransactionSyncHandler.syncSingle(
                    [
                        ['SINCE', syncDate],
                        ['HEADER', 'FROM', account.bank.alert_email_id]
                    ],
                    account,
                    (transaction) => {
                        let id = RepositoryUtils.generateAccountTransactionId(transaction);
                        accountTransactionRepository
                            .find({
                                where: {
                                    transaction_id: id
                                }
                            })
                            .then((value) => {
                                if (value.length === 1) return;
                                transaction.transaction_id = id;
                                accountTransactionRepository.save(transaction).then((updatedTransaction) => {
                                    if (!updatedTransaction) return;
                                    account.last_synced_on = new Date();
                                    account.account_balance =
                                        account.account_balance +
                                        (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) *
                                            updatedTransaction.amount;
                                    accountRepository.update({ account_id: account.account_id }, account);
                                });
                            });
                    }
                );
            });
        })();
    }
}
