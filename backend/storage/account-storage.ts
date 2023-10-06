import { Database } from '../database/database.js';
import { Account } from '../models/account.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('AccountStorage');

class AccountStorage implements Database<Account, number> {
    static rowCount: number = 1;

    setCurrentRowIndex(index: number) {
        AccountStorage.rowCount = index;
    }

    async add(item: Account): Promise<Account | undefined> {
        let accountPromise = this.find(item.id);
        const account = await accountPromise;
        if (account) return account;
        return new Promise((resolve, reject) => {
            item.id = AccountStorage.rowCount++;
            sqlDatabaseProvider.database?.run(
                'INSERT INTO accounts(id, accountName, accountBalance, initialBalance, bankAccountNumber, accountType, accountIcon, accountBackgroundColor, bankAccountType, bank, lastSyncedOn) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                [
                    item.id,
                    item.accountName,
                    item.accountBalance,
                    item.initialBalance,
                    item.bankAccountNumber,
                    item.accountType,
                    item.accountIcon,
                    item.accountBackgroundColor,
                    item.bankAccountType,
                    item.bank,
                    item.lastSyncedOn
                ],
                (error) => {
                    if (error) {
                        logger.error(`[Add] - Error On Add ${error.message}`);
                        reject(error);
                        AccountStorage.rowCount--;
                        return;
                    }
                    resolve(item);
                }
            );
        });
    }

    delete(id: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM accounts WHERE id = ?;', id, (error) => {
                if (error) {
                    logger.error(`[Delete] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                AccountStorage.rowCount--;
            });
        });
    }

    deleteAll(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM accounts;', (error) => {
                if (error) {
                    logger.error(`[DeleteAll] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                AccountStorage.rowCount = 0;
            });
        });
    }

    find(id: number): Promise<Account | undefined> {
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.get<Account>('SELECT * FROM accounts WHERE id = ?;', id, (error, row) => {
                if (error) {
                    logger.error(`[Find] - Error On Find ${error.message}`);
                    reject(error);
                }
                resolve(row);
            });
        });
    }

    findAll(criteria: Criteria): Promise<Account[]> {
        let findSQL = 'SELECT * FROM accounts';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        return new Promise<Account[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<Account>(findSQL, where.whereClauses, (error, rows) => {
                if (error) {
                    logger.error(`[FindAll] - Error On FindAll ${error.message}`);
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async update(item: Account): Promise<Account | undefined> {
        let accountPromise = this.find(item.id);
        return accountPromise
            .then((account) => {
                if (account) {
                    let deletePromise = this.delete(account.id);
                    return deletePromise.then((deleted) => {
                        if (deleted) {
                            return this.add(item);
                        }
                        return undefined;
                    });
                }
                return undefined;
            })
            .catch((reason) => {
                logger.error(`[Update] - Error On Delete ${reason}`);
                return undefined;
            });
    }
}

export const accountStorage = new AccountStorage();
