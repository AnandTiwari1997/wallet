import { Database } from '../database/database.js';
import { Bank } from '../models/bank.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('BankStorage');

class BankStorage implements Database<Bank, number> {
    static rowCount: number = 1;

    setCurrentRowIndex(index: number) {
        BankStorage.rowCount = index;
    }

    async add(item: Bank): Promise<Bank | undefined> {
        const bank = await this.find(item.id);
        if (bank) return bank;
        item.id = BankStorage.rowCount++;
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.run(
                'INSERT INTO bank(id, name, icon, alertEmailId, primaryColor) VALUES(?, ?, ?, ?, ?);',
                [item.id, item.name, item.icon, item.alertEmailId, item.primaryColor],
                (error) => {
                    if (error) {
                        logger.error(`[Add] - Error On Add ${error.message}`);
                        reject(error);
                        return;
                    }
                    resolve(item);
                }
            );
        });
    }

    delete(id: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM bank WHERE id = ?;', id, (error) => {
                if (error) {
                    logger.error(`[Delete] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                BankStorage.rowCount--;
            });
        });
    }

    deleteAll(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM bank;', (error) => {
                if (error) {
                    logger.error(`[DeleteAll] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                BankStorage.rowCount = 0;
            });
        });
    }

    find(id: number): Promise<Bank | undefined> {
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.get<Bank>('SELECT * FROM bank WHERE id = ?;', id, (error, row) => {
                if (error) {
                    logger.error(`[Find] - Error On Find ${error.message}`);
                    reject(error);
                }
                resolve(row);
            });
        });
    }

    findAll(criteria: Criteria): Promise<Bank[]> {
        let findSQL = 'SELECT * FROM bank';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        return new Promise<Bank[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<Bank>(findSQL, where.whereClauses, (error, rows) => {
                if (error) {
                    logger.error(`[FindAll] - Error On FindAll ${error.message}`);
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async update(item: Bank): Promise<Bank | undefined> {
        let bankPromise = this.find(item.id);
        return bankPromise
            .then((bank) => {
                if (bank) {
                    let deletePromise = this.delete(bank.id);
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

export const bankStorage = new BankStorage();
