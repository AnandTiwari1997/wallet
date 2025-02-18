import { IScheduler } from './scheduler.js';
import { accountRepository } from '../database/repository/account-repository.js';
import {
    bankAccountTransactionSyncHandler,
    billsSyncHandler,
    creditCardSyncHandler,
    dematAccountSyncHandler,
    loanAccountTransactionSyncHandler
} from '../singleton.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { Logger } from '../core/logger.js';
import { billRepository } from '../database/repository/bill-repository.js';

const logger: Logger = new Logger('Schedulers');

export class Schedulers implements IScheduler<any> {
    schedule(intervalInMS: number = 1000 * 60 * 60 * 24): void {
        this.bankAccountSync();
        this.loanAccountSync();
        this.creditCardAccountSync();
        this.dematAccountSync();
        this.billSync();
        setInterval(this.bankAccountSync, intervalInMS);
        setInterval(this.loanAccountSync, intervalInMS);
        setInterval(this.creditCardAccountSync, intervalInMS);
        setInterval(this.dematAccountSync, intervalInMS);
        setInterval(this.billSync, intervalInMS);
    }

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

    private billSync(): void {
        logger.info(`Bills Sync Started`);
        billRepository.find().then((bills) => {
            billsSyncHandler.sync(bills, true);
        });
    }
}
