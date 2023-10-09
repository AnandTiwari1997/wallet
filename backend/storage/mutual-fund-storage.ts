import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { IMutualFundTransaction, MutualFundTransaction, MutualFundTransactionBuilder } from '../models/mutual-fund-transaction.js';
import { Database } from '../database/database.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('MutualFundStorage');

class MutualFundStorage implements Database<MutualFundTransaction, string> {
    async find(id: string): Promise<MutualFundTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>('SELECT * FROM mutual_fund WHERE transaction_id = $1;', [id], false);
            if (!queryResult.rows[0]) return;
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return;
        }
    }

    async add(item: MutualFundTransaction): Promise<MutualFundTransaction | undefined> {
        const id = this.generateId(item);
        let mutualFundPromise = this.find(id);
        const mutualFundT = await mutualFundPromise;
        if (mutualFundT) return mutualFundT;
        try {
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>(
                'INSERT INTO mutual_fund(transaction_id, fund_name, portfolio_number, transaction_date, description, amount, is_credit, nav, units, latest_nav) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;',
                [item.transactionId, item.fundName, item.portfolioNumber, item.transactionDate.toISOString(), item.description, item.amount, item.isCredit, item.nav, item.units, item.latestNav],
                true
            );
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    async findAll(criteria: Criteria): Promise<MutualFundTransaction[]> {
        try {
            let findSQL = 'SELECT * FROM mutual_fund';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((mfTransaction) => MutualFundTransactionBuilder.buildFromEntity(mfTransaction));
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM mutual_fund WHERE transaction_id = $1;', [id], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM mutual_fund;', [], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[DeleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async update(item: MutualFundTransaction): Promise<MutualFundTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>(
                'UPDATE mutual_fund SET fund_name=$1, portfolio_number=$2, transaction_date=$3, description=$4, amount=$5, is_credit=$6, nav=$7, units=$8, latest_nav=$9 WHERE transaction_id=$10 RETURNING *;',
                [item.fundName, item.portfolioNumber, item.transactionDate.toISOString(), item.description, item.amount, item.isCredit, item.nav, item.units, item.latestNav, item.transactionId],
                true
            );
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }

    generateId = (item: MutualFundTransaction): string => {
        return item.fundName + '_' + item.portfolioNumber + '_' + item.transactionDate;
    };

    async findAllUsingGroupBy(criteria: Criteria) {
        try {
            let innerSql = `SELECT fund_name
                            FROM mutual_fund`;
            let where = addWhereClause(innerSql, criteria);
            innerSql = where.sql;
            innerSql = addGroupByClause(innerSql, criteria);
            // innerSql = addOrderByClause(innerSql, criteria);
            innerSql = addLimitAndOffset(innerSql, criteria);
            let findSQL = `SELECT *
                           FROM mutual_fund
                           WHERE fund_name IN (${innerSql})`;
            findSQL = addOrderByClause(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((mfTransaction) => MutualFundTransactionBuilder.buildFromEntity(mfTransaction));
        } catch (error) {
            logger.error(`[FindAllUsingGroupBy] - Error On FindAllUsingGroupBy ${error}`);
            return [];
        }
    }

    async count(criteria: Criteria) {
        try {
            let innerSql = `SELECT DISTINCT SUM(1) OVER () as num_found
                            FROM mutual_fund`;
            let where = addWhereClause(innerSql, criteria);
            innerSql = where.sql;
            innerSql = addGroupByClause(innerSql, criteria);
            let queryResult = await sqlDatabaseProvider.execute<{
                num_found: number;
            }>(innerSql, where.whereClauses, false);
            return queryResult.rows[0].num_found || 0;
        } catch (error) {
            logger.error(`[Count] - Error On Count ${error}`);
            return 0;
        }
    }
}

export const mutualFundStorage = new MutualFundStorage();
