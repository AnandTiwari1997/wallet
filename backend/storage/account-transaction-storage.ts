import { Database } from '../database/database.js';
import { Transaction } from '../models/account-transaction.js';
import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('AccountTransactionStorage');

class AccountTransactionStorage implements Database<Transaction, string> {
    async add(item: Transaction): Promise<Transaction | undefined> {
        const id = this.generateId(item);
        let providentFundPromise = this.find(id);
        const providentFundTransaction = await providentFundPromise;
        if (providentFundTransaction) return providentFundTransaction;
        item.transactionId = id;
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.run(
                'INSERT INTO account_transaction(transactionId, account, transactionDate, amount, transactionType, category, paymentMode, note, labels, currency, transactionState, date) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                [
                    item.transactionId,
                    item.account,
                    item.transactionDate.toISOString(),
                    item.amount,
                    item.transactionType,
                    item.category,
                    item.paymentMode,
                    item.note,
                    item.labels,
                    item.currency,
                    item.transactionState,
                    item.transactionDate.toISOString().slice(0, 10)
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
    }

    delete(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    deleteAll(): Promise<boolean> {
        return Promise.resolve(false);
    }

    find(id: string): Promise<Transaction | undefined> {
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.get<Transaction>('SELECT * FROM account_transaction WHERE transactionId = ?;', id, (error, row) => {
                if (error) {
                    logger.error(`[Find] - Error On Find ${error.message}`);
                    reject(error);
                }
                resolve(row);
            });
        });
    }

    findAll(criteria: Criteria): Promise<Transaction[]> {
        let findSQL = 'SELECT * FROM account_transaction';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        return new Promise<Transaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<Transaction>(findSQL, where.whereClauses, (error, rows) => {
                if (error) {
                    logger.error(`[FindAll] - Error On FindAll ${error.message}`);
                    reject(error);
                    return;
                }
                let newRows = rows.map((row) => {
                    row.transactionDate = new Date(row.transactionDate);
                    return row;
                });
                resolve(newRows);
            });
        });
    }

    update(item: Transaction): Promise<Transaction | undefined> {
        return Promise.resolve(undefined);
    }

    generateId = (item: Transaction): string => {
        let id = '';
        for (let key of item) {
            id = id + String(key);
        }
        return id;
    };

    findAllUsingGroupBy = (criteria: Criteria) => {
        let innerSql = `SELECT date
                        FROM account_transaction`;
        let where = addWhereClause(innerSql, criteria);
        innerSql = where.sql;
        innerSql = addGroupByClause(innerSql, criteria);
        innerSql = addOrderByClause(innerSql, criteria);
        innerSql = addLimitAndOffset(innerSql, criteria);
        let findSQL = `SELECT *
                       FROM account_transaction
                       WHERE date IN (${innerSql})
                       ORDER BY transactionDate DESC`;
        return new Promise<Transaction[]>((resolve, reject) => {
            sqlDatabaseProvider.database?.all<Transaction>(findSQL, where.whereClauses, (error, rows) => {
                if (error) {
                    logger.error(`[findAllUsingGroupBy] - Error On findAllUsingGroupBy ${error.message}`);
                    reject(error);
                    return;
                }
                let newRows = rows.map((row) => {
                    row.transactionDate = new Date(row.transactionDate);
                    return row;
                });
                resolve(newRows);
            });
        });
    };

    count = (criteria: Criteria) => {
        let innerSql = `SELECT DISTINCT SUM(1) OVER () numFound
                        FROM account_transaction`;
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

export const accountTransactionStorage = new AccountTransactionStorage();
