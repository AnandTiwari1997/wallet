import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { ProvidentFundTransaction } from '../models/provident-fund-transaction.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Database } from '../database/database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('ProvidentFundStorage');

class ProvidentFundStorage implements Database<ProvidentFundTransaction, string> {
    find(id: string): Promise<ProvidentFundTransaction | undefined> {
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.get<ProvidentFundTransaction>('SELECT * FROM provident_fund WHERE transactionId = ?;', id, (error, row) => {
                if (error) {
                    logger.error(`[Find] - Error On Find ${error.message}`);
                    reject(error);
                }
                resolve(row);
            });
        });
    }

    async add(item: ProvidentFundTransaction): Promise<ProvidentFundTransaction | undefined> {
        const id = this.generateId(item);
        let providentFundPromise = this.find(id);
        return providentFundPromise.then((providentFundTransaction) => {
            if (providentFundTransaction) return providentFundTransaction;
            item.transactionId = id;
            return new Promise((resolve, reject) => {
                sqlDatabaseProvider.database?.run(
                    'INSERT INTO provident_fund(transactionId, wageMonth, financialYear, transactionDate, description, transactionType, epfAmount, epsAmount, employeeContribution, employerContribution, pensionAmount) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                    [
                        item.transactionId,
                        item.wageMonth,
                        item.financialYear,
                        item.transactionDate.toISOString(),
                        item.description,
                        item.transactionType,
                        item.epfAmount,
                        item.epsAmount,
                        item.employeeContribution,
                        item.employerContribution,
                        item.pensionAmount
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
        });
    }

    findAll(criteria: Criteria): Promise<ProvidentFundTransaction[]> {
        let findSQL = 'SELECT * FROM provident_fund';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        return new Promise<ProvidentFundTransaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<ProvidentFundTransaction>(findSQL, where.whereClauses, (error, rows) => {
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
            sqlDatabaseProvider.database?.run('DELETE FROM provident_fund WHERE transactionId = ?;', id, (error) => {
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
            sqlDatabaseProvider.database?.run('DELETE FROM provident_fund;', (error) => {
                if (error) {
                    logger.error(`[DeleteAll] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    async update(item: ProvidentFundTransaction): Promise<ProvidentFundTransaction | undefined> {
        let providentFundPromise = this.find(item.transactionId);
        return providentFundPromise
            .then((providentFundTransaction) => {
                if (providentFundTransaction) {
                    let deletePromise = this.delete(providentFundTransaction.transactionId);
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

    generateId = (item: ProvidentFundTransaction): string => {
        let id = '';
        for (let key of item) {
            id = id + String(key);
        }
        return id;
    };

    findAllUsingGroupBy = (criteria: Criteria) => {
        let innerSql = `SELECT financialYear
                        FROM provident_fund`;
        let where = addWhereClause(innerSql, criteria);
        innerSql = where.sql;
        innerSql = addGroupByClause(innerSql, criteria);
        innerSql = addOrderByClause(innerSql, criteria);
        innerSql = addLimitAndOffset(innerSql, criteria);
        let findSQL = `SELECT *
                       FROM provident_fund
                       WHERE financialYear IN (${innerSql})
                       ORDER BY transactionDate DESC`;
        return new Promise<ProvidentFundTransaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<ProvidentFundTransaction>(findSQL, where.whereClauses, (error, rows) => {
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
                        FROM provident_fund`;
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
                if (row) resolve(row.numFound);
                else resolve(0);
            });
        });
    };
}

export const providentFundStorage = new ProvidentFundStorage();
