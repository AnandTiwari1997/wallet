import { startOfYear, subYears } from 'date-fns';
import { ISyncHandler } from './sync-handler.js';
import { Logger } from '../core/logger.js';
import { Account } from '../database/models/account.js';
import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { TransactionType } from '../database/models/account-transaction.js';
import { commonAccountTransactionSyncHandler } from '../singleton.js';

// Create a logger instance for this specific handler to facilitate debugging and monitoring.
const logger: Logger = new Logger('BankAccountTransactionSyncHandler');

/**
 * This class implements the ISyncHandler interface for bank accounts.
 * It's responsible for synchronizing transactions for specified bank accounts.
 */
export class BankAccountTransactionSyncHandler implements ISyncHandler<Account> {
    /**
     * Synchronizes transactions for a single bank account.
     *
     * @param account The bank account to synchronize.
     * @param deltaSync A boolean indicating whether to perform a delta sync.
     * @private
     */
    private syncSingleBankAccount(account: Account, deltaSync: boolean) {
        // Determine the starting date for the sync. For a delta sync, it's the last-synced date; for a full sync, it's three years ago from the start of the current year.
        let syncDate = deltaSync ? account.last_synced_on : subYears(startOfYear(new Date()), 3);
        // Use a common handler to sync transactions for a single account.
        commonAccountTransactionSyncHandler.syncSingle(
            [
                ['SINCE', syncDate],
                ['HEADER', 'FROM', account.bank.alert_email_id]
            ],
            account,
            (transaction) => {
                // Generate a unique ID for the transaction to prevent duplicates.
                let id = RepositoryUtils.generateAccountTransactionId(transaction);
                // Check if the transaction already exists in the database.
                accountTransactionRepository
                    .find({
                        where: {
                            transaction_id: id
                        }
                    })
                    .then((value) => {
                        // If the transaction already exists, do nothing.
                        if (value.length === 1) return;
                        // If it's a new transaction, save it to the database.
                        transaction.transaction_id = id;
                        accountTransactionRepository.save(transaction).then((updatedTransaction) => {
                            // If the transaction wasn't saved, do nothing.
                            if (!updatedTransaction) return;
                            // Update the account's last synced date to the current time.
                            account.last_synced_on = new Date();
                            // Update the account's balance based on the transaction type (income or expense).
                            account.account_balance =
                                account.account_balance +
                                (updatedTransaction.transaction_type === TransactionType.INCOME ? 1 : -1) *
                                    updatedTransaction.amount;
                            // Persist the updated account information to the database.
                            accountRepository.update({ account_id: account.account_id }, account).then((r) => {});
                        });
                    });
            }
        );
    }

    /**
     * This method synchronizes transactions for a given list of accounts.
     * @param accounts An array of Account objects to be synchronized.
     * @param deltaSync A boolean flag indicating whether to perform a delta sync (true) or a full sync (false).
     */
    sync(accounts: Account[], deltaSync: boolean) {
        (async () => {
            // Filter to remove accounts other than bank accounts
            let bankAccountsToSync = accounts.filter((account) => account.account_type === 'BANK' && account.bank);

            logger.info(
                `Syncing has been started for following bank accounts`,
                accounts.map((account) => account.account_name)
            );

            // Process all accounts in parallel for better performance.
            // Promise.allSettled ensures that one failed sync doesn't stop the others.
            const syncPromises = bankAccountsToSync.map((account) => this.syncSingleBankAccount(account, deltaSync));
            const results = await Promise.allSettled(syncPromises);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const accountName = bankAccountsToSync[index].account_name;
                    logger.error(`Failed to sync account: ${accountName}`, result.reason);
                }
            });
        })();
    }
}
