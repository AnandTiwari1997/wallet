import { Account } from '../database/models/account.js';

import { ISyncHandler } from './sync-handler.js';
import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { TransactionType } from '../database/models/account-transaction.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { Logger } from '../core/logger.js';
import { commonAccountTransactionSyncHandler } from '../singleton.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';

const logger = new Logger('LoanAccountTransactionSyncHandler');

export class LoanAccountTransactionSyncHandler implements ISyncHandler<Account> {
    sync(accounts: Account[], deltaSync: boolean): void {
        (async () => {
            logger.info(
                `Syncing has been started for following loan accounts`,
                accounts.map((account) => account.account_name)
            );
            accounts.forEach((account) => {
                if (account.account_type !== 'LOAN') return;
                if (!account.bank) return;
                let syncDate = deltaSync ? account.last_synced_on : account.start_date;
                let searchTokens = account.search_text.split(',');
                let previous: any[] = ['BODY', searchTokens[0]];
                for (let i = 1; i < searchTokens.length; i++) {
                    previous = ['OR', ['BODY', searchTokens[i]], previous];
                }
                let criteria: any[] = [];
                criteria.push(['SINCE', syncDate]);
                criteria.push(previous);
                commonAccountTransactionSyncHandler.syncSingle(criteria, account, (transaction) => {
                    transaction.transaction_id = RepositoryUtils.generateAccountTransactionId(transaction);
                    accountTransactionRepository.save(transaction).then((updatedTransaction) => {
                        if (!updatedTransaction) return;
                        account.last_synced_on = new Date();
                        if (deltaSync) {
                            account.account_balance =
                                account.account_balance +
                                (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) *
                                    updatedTransaction.amount;
                        }
                        accountRepository.update({ account_id: account.account_id }, account);
                    });
                });
            });
        })();
    }
}
