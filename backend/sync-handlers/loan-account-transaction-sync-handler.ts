import { Account } from '../database/models/account.js';

import { ISyncHandler } from './sync-handler.js';
import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { TransactionType } from '../database/models/account-transaction.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { Logger } from '../core/logger.js';
import { commonAccountTransactionSyncHandler } from '../singleton.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';

const logger = new Logger('LoanAccountTransactionSyncHandler');

/**
 * Handles the synchronization of transactions for loan accounts.
 */
export class LoanAccountTransactionSyncHandler implements ISyncHandler<Account> {
    /**
     * Syncs transactions for a single loan account.
     * @param account The credit card account to sync.
     * @param deltaSync Whether to perform a delta sync.
     */
    private syncSingleLoanAccount(account: Account, deltaSync: boolean) {
        // Determine the sync date based on whether it's a delta sync.
        let syncDate = deltaSync ? account.last_synced_on : account.start_date;
        let searchTokens = account.search_text.split(',');
        // Build the search criteria for fetching emails.
        let previous: any[] = ['BODY', searchTokens[0]];
        for (let i = 1; i < searchTokens.length; i++) {
            previous = ['OR', ['BODY', searchTokens[i]], previous];
        }
        let criteria: any[] = [];
        criteria.push(['SINCE', syncDate]);
        criteria.push(previous);
        // Sync transactions for a single account.
        commonAccountTransactionSyncHandler.syncSingle(criteria, account, (transaction) => {
            transaction.transaction_id = RepositoryUtils.generateAccountTransactionId(transaction);
            accountTransactionRepository.save(transaction).then((updatedTransaction) => {
                if (!updatedTransaction) return;
                account.last_synced_on = new Date();
                // Update the account balance if it's a delta sync.
                if (deltaSync) {
                    account.account_balance =
                        account.account_balance +
                        (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) *
                            updatedTransaction.amount;
                }
                accountRepository.update({ account_id: account.account_id }, account).then();
            });
        });
    }

    /**
     * Syncs transactions for multiple loan accounts.
     * @param accounts The accounts to sync.
     * @param deltaSync Whether to perform a delta sync.
     */
    sync(accounts: Account[], deltaSync: boolean): void {
        (async () => {
            // Filter to remove accounts other than bank accounts
            let creditCardAccountsToSync = accounts.filter(
                (account) => account.account_type === 'LOAN' && account.bank
            );

            logger.info(
                `Syncing has been started for following credit card accounts`,
                accounts.map((account) => account.account_name)
            );

            // Process all accounts in parallel for better performance.
            // Promise.allSettled ensures that one failed sync doesn't stop the others.
            const syncPromises = creditCardAccountsToSync.map((account) =>
                this.syncSingleLoanAccount(account, deltaSync)
            );
            const results = await Promise.allSettled(syncPromises);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const accountName = creditCardAccountsToSync[index].account_name;
                    logger.error(`Failed to sync account: ${accountName}`, result.reason);
                }
            });
        })();
    }
}
