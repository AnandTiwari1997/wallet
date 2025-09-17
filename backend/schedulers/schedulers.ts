import { IScheduler } from './scheduler.js';
import { accountRepository } from '../database/repository/account-repository.js';
import {
    bankAccountTransactionSyncHandler,
    creditCardSyncHandler,
    dematAccountSyncHandler,
    loanAccountTransactionSyncHandler
} from '../singleton.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { Logger } from '../core/logger.js';
import { inMemoryStorage } from '../database/repository/in-memory-storage.js';

// Create a logger instance for this module.
const logger: Logger = new Logger('AccountSchedulers');

/**
 * Schedulers class implements the IScheduler interface to schedule various account synchronization tasks.
 */
export class Schedulers implements IScheduler<any> {
    /**
     * Schedules the synchronization tasks to run at a specified interval.
     * @param intervalInMS The interval in milliseconds at which to run the schedulers. Defaults to 24 hours.
     */
    schedule(intervalInMS: number = 1000 * 60 * 60 * 24): void {
        // Run the sync tasks once immediately.
        this.bankAccountSync();
        this.loanAccountSync();
        this.creditCardAccountSync();
        this.dematAccountSync();

        // Schedule the sync tasks to run at the specified interval.
        setInterval(this.bankAccountSync, intervalInMS);
        setInterval(this.loanAccountSync, intervalInMS);
        setInterval(this.creditCardAccountSync, intervalInMS);
        setInterval(this.dematAccountSync, intervalInMS);

        // Schedule the consent expiration check to run every 2 minutes.
        setInterval(this.consentExpirationCheckScheduler, 1000 * 60 * 2);
    }

    /**
     * Synchronizes bank account transactions.
     * @private
     */
    private bankAccountSync(): void {
        logger.info(`Bank Account Sync Started`);
        accountRepository
            .find({
                where: { account_type: 'BANK' },
                relations: { bank: true }
            })
            .then((bankAccounts) => {
                bankAccountTransactionSyncHandler.sync(bankAccounts, true);
            });
    }

    /**
     * Synchronizes loan account transactions.
     * @private
     */
    private loanAccountSync(): void {
        logger.info(`Loan Account Sync Started`);
        accountRepository
            .find({
                where: { account_type: 'LOAN' },
                relations: { bank: true }
            })
            .then((loanAccounts) => {
                loanAccountTransactionSyncHandler.sync(loanAccounts, true);
            });
    }

    /**
     * Synchronizes credit card account transactions.
     * @private
     */
    private creditCardAccountSync(): void {
        logger.info(`Credit Card Account Sync Started`);
        accountRepository
            .find({
                where: { account_type: 'CREDIT_CARD' },
                relations: { bank: true }
            })
            .then((creditCardAccounts) => {
                creditCardSyncHandler.sync(creditCardAccounts, true);
            });
    }

    /**
     * Synchronizes demat account holdings.
     * @private
     */
    private dematAccountSync(): void {
        logger.info(`Demat Account Sync Started`);
        dematAccountRepository
            .find({
                relations: { broker: true }
            })
            .then((dematAccounts) => {
                dematAccountSyncHandler.sync(dematAccounts, true);
            });
    }

    /**
     * Checks for and removes expired consents from in-memory storage.
     * @private
     */
    private consentExpirationCheckScheduler(): void {
        logger.info(`Consent Expiration Check Started`);
        let allConsents = inMemoryStorage.get('consents')?.value;
        if (allConsents) {
            for (let consent in allConsents) {
                if (allConsents[consent].expiration < new Date().getTime()) {
                    delete allConsents[consent];
                    inMemoryStorage.update({ key: 'consents', value: allConsents });
                }
            }
        }
    }
}
