import { Repository } from './repository.js';
import { Transaction, TransactionBuilder } from '../models/account-transaction.js';
import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';
import { Account } from '../models/account.js';

const logger: Logger = new Logger('AccountTransactionRepository');

class AccountTransactionRepository implements Repository<Transaction, string> {
    async add(item: Transaction): Promise<Transaction | undefined> {
        item.transaction_id = this.generateId(item);
        try {
            let queryResult = await sqlDatabaseProvider.execute<Transaction>(
                'INSERT INTO account_transaction(transaction_id, account, transaction_date, amount, transaction_type, category, payment_mode, note, labels, currency, transaction_state, dated) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;',
                [
                    item.transaction_id,
                    item.account.account_id,
                    item.transaction_date,
                    item.amount,
                    item.transaction_type,
                    item.category,
                    item.payment_mode,
                    item.note,
                    item.labels,
                    item.currency,
                    item.transaction_state,
                    item.transaction_date
                ],
                true
            );

            return await this.find(queryResult.rows[0].transaction_id);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    delete(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    deleteAll(): Promise<boolean> {
        return Promise.resolve(false);
    }

    async find(id: string): Promise<Transaction | undefined> {
        try {
            let findSQL = 'SELECT * FROM account_transaction WHERE transaction_id = $1';
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN account b ON a.account = b.account_id;`;
            let queryResult = await sqlDatabaseProvider.execute<Transaction & Account>(joinQuery, [id], false);
            return TransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return;
        }
    }

    async findAll(criteria: Criteria): Promise<Transaction[]> {
        try {
            let findSQL = `SELECT dated
                           FROM account_transaction`;
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN account b ON a.account = b.account_id;`;
            let queryResults = await sqlDatabaseProvider.execute<Transaction & Account>(findSQL, where.whereClauses, false);
            return queryResults.rows.map((row) => TransactionBuilder.buildFromEntity(row));
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    update(item: Transaction): Promise<Transaction | undefined> {
        return Promise.resolve(undefined);
    }

    generateId = (item: Transaction): string => {
        return item.transaction_date.toISOString() + '_' + item.account.account_id.toString() + '_' + item.amount;
    };

    async findAllUsingGroupBy(criteria: Criteria) {
        try {
            let innerSql = `SELECT dated
                            FROM account_transaction`;
            let where = addWhereClause(innerSql, criteria);
            innerSql = where.sql;
            innerSql = addGroupByClause(innerSql, criteria);
            innerSql = addOrderByClause(innerSql, criteria);
            innerSql = addLimitAndOffset(innerSql, criteria);
            let findSQL = `SELECT *
                           FROM account_transaction
                           WHERE dated IN (${innerSql})`;
            findSQL = addOrderByClause(findSQL, criteria);
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN account b ON a.account = b.account_id;`;
            let queryResults = await sqlDatabaseProvider.execute<Transaction & Account>(joinQuery, where.whereClauses, false);
            return queryResults.rows.map((row) => TransactionBuilder.buildFromEntity(row));
        } catch (error) {
            logger.error(`[FindAllUsingGroupBy] - Error On FindAllUsingGroupBy ${error}`);
            return [];
        }
    }

    async count(criteria: Criteria) {
        try {
            let innerSql = `SELECT DISTINCT SUM(1) OVER () as num_found
                            FROM account_transaction`;
            let where = addWhereClause(innerSql, criteria);
            innerSql = where.sql;
            innerSql = addGroupByClause(innerSql, criteria);
            let queryResult = await sqlDatabaseProvider.execute<{
                num_found: number;
            }>(innerSql, where.whereClauses, false);
            return queryResult.rows[0].num_found;
        } catch (error) {
            logger.error(`[Count] - Error On Count ${error}`);
            return 0;
        }
    }
}

export const accountTransactionRepository = new AccountTransactionRepository();
