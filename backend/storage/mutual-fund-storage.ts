import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { Database } from '../database/database.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('MutualFundStorage');

class MutualFundStorage implements Database<MutualFundTransaction, string> {
    find(id: string): Promise<MutualFundTransaction | undefined> {
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.get<MutualFundTransaction>('SELECT * FROM mutual_fund WHERE transactionId = ?;', id, (error, row) => {
                if (error) {
                    logger.error(`[Find] - Error On Find ${error.message}`);
                    reject(error);
                }
                resolve(row);
            });
        });
    }

    async add(item: MutualFundTransaction): Promise<MutualFundTransaction | undefined> {
        const id = this.generateId(item);
        let mutualFundPromise = this.find(id);
        const mutualFundT = await mutualFundPromise;
        if (mutualFundT) return mutualFundT;
        else {
            try {
                item.transactionId = id;
                return new Promise<MutualFundTransaction>((resolve, reject) => {
                    sqlDatabaseProvider.database?.run(
                        'INSERT INTO mutual_fund(transactionId, fundName, portfolioNumber, transactionDate, description, amount, isCredit, nav, units, latestNav) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                        [
                            item.transactionId,
                            item.fundName,
                            item.portfolioNumber,
                            item.transactionDate.toISOString(),
                            item.description,
                            item.amount,
                            item.isCredit,
                            item.nav,
                            item.units,
                            item.latestNav
                        ],
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
            } catch (error_1: any) {
                return undefined;
            }
        }
    }

    findAll(criteria: Criteria): Promise<MutualFundTransaction[]> {
        let findSQL = 'SELECT * FROM mutual_fund';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        return new Promise<MutualFundTransaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<MutualFundTransaction>(findSQL, where.whereClauses, (error, rows) => {
                if (error) {
                    logger.error(`[FindAll] - Error On FindAll ${error.message}`);
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    }

    delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM mutual_fund WHERE transactionId = ?;', id, (error) => {
                if (error) {
                    logger.error(`[Delete] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    deleteAll(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM mutual_fund;', (error) => {
                if (error) {
                    logger.error(`[DeleteAll] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    async update(item: MutualFundTransaction): Promise<MutualFundTransaction | undefined> {
        let mutualFundPromise = this.find(item.transactionId);
        return mutualFundPromise
            .then((mutualFundTransaction) => {
                if (mutualFundTransaction) {
                    let deletePromise = this.delete(mutualFundTransaction.transactionId);
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

    generateId = (item: MutualFundTransaction): string => {
        let id = '';
        for (let key of item) {
            id = id + String(key);
        }
        return id;
    };

    findAllUsingGroupBy = (criteria: Criteria) => {
        let innerSql = `SELECT fundName
                        FROM mutual_fund`;
        let where = addWhereClause(innerSql, criteria);
        innerSql = where.sql;
        innerSql = addGroupByClause(innerSql, criteria);
        innerSql = addOrderByClause(innerSql, criteria);
        innerSql = addLimitAndOffset(innerSql, criteria);
        let findSQL = `SELECT *
                       FROM mutual_fund
                       WHERE fundName IN (${innerSql})
                       ORDER BY transactionDate DESC`;
        return new Promise<MutualFundTransaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<MutualFundTransaction>(findSQL, where.whereClauses, (error, rows) => {
                logger.info(findSQL);
                if (error) {
                    logger.error(`[findAllUsingGroupBy] - Error On findAllUsingGroupBy ${error.message}`);
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    };

    count = (criteria: Criteria) => {
        let innerSql = `SELECT DISTINCT SUM(1) OVER () numFound
                        FROM mutual_fund`;
        let where = addWhereClause(innerSql, criteria);
        innerSql = where.sql;
        innerSql = addGroupByClause(innerSql, criteria);
        innerSql = addOrderByClause(innerSql, criteria);
        return new Promise<number>((resolve, reject) => {
            sqlDatabaseProvider.database?.get<any>(innerSql, where.whereClauses, (error, row) => {
                if (error) {
                    logger.error(`[Count] - Error On Count ${error.message}`);
                    reject(error);
                    return;
                }
                logger.info(row);
                resolve(row.numFound);
            });
        });
    };
}

export const mutualFundStorage = new MutualFundStorage();
