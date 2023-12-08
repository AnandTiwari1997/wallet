import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { IMutualFundTransaction, MutualFundTransaction, MutualFundTransactionBuilder } from '../models/mutual-fund-transaction.js';
import { Repository } from './repository.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('MutualFundRepository');

class MutualFundRepository implements Repository<MutualFundTransaction, string> {
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
            item.transaction_id = id;
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>(
                'INSERT INTO mutual_fund(transaction_id, fund_name, portfolio_number, transaction_date, description, amount, is_credit, nav, units, latest_nav, isin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;',
                [
                    item.transaction_id,
                    item.fund_name,
                    item.portfolio_number,
                    item.transaction_date.toISOString(),
                    item.description,
                    item.amount,
                    item.is_credit,
                    item.nav,
                    item.units,
                    item.latest_nav,
                    item.isin
                ],
                true
            );
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            logger.error(item);
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
                [item.fund_name, item.portfolio_number, item.transaction_date.toISOString(), item.description, item.amount, item.is_credit, item.nav, item.units, item.latest_nav, item.transaction_id],
                true
            );
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }

    generateId = (item: MutualFundTransaction): string => {
        return item.fund_name + '_' + item.portfolio_number + '_' + item.transaction_date + '_' + item.description;
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

    async findAllDistinctFundByISIN() {
        try {
            let sql = `SELECT isin
                            FROM mutual_fund GROUP BY isin`;
            let queryResult = await sqlDatabaseProvider.execute<{
                isin: string;
            }>(sql, [], false);
            return queryResult.rows.map((row) => row.isin);
        } catch (error) {
            logger.error(`[Count] - Error On Count ${error}`);
            return [];
        }
    }

    async updateByISIN(item: String, latest_nav: number): Promise<MutualFundTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IMutualFundTransaction>('UPDATE mutual_fund SET latest_nav=$1 WHERE isin=$2 RETURNING *;', [latest_nav, item], true);
            return MutualFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const mutualFundRepository = new MutualFundRepository();
