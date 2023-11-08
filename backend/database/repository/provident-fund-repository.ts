import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { IProvidentFundTransaction, ProvidentFundTransaction, ProvidentFundTransactionBuilder } from '../models/provident-fund-transaction.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Repository } from './repository.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('ProvidentFundRepository');

class ProvidentFundRepository implements Repository<ProvidentFundTransaction, string> {
    async find(id: string): Promise<ProvidentFundTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IProvidentFundTransaction>('SELECT * FROM provident_fund WHERE transaction_id = $1;', [id], false);
            if (!queryResult.rows[0]) return;
            return ProvidentFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return;
        }
    }

    async add(item: ProvidentFundTransaction): Promise<ProvidentFundTransaction | undefined> {
        const id = this.generateId(item);
        let mutualFundPromise = this.find(id);
        const mutualFundT = await mutualFundPromise;
        if (mutualFundT) return mutualFundT;
        try {
            item.transaction_id = id;
            let queryResult = await sqlDatabaseProvider.execute<IProvidentFundTransaction>(
                'INSERT INTO provident_fund(transaction_id, wage_month, financial_year, transaction_date, description, transaction_type, epf_amount, eps_amount, employee_contribution, employer_contribution, pension_amount) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;',
                [
                    item.transaction_id,
                    item.wage_month,
                    item.financial_year,
                    item.transaction_date.toISOString(),
                    item.description,
                    item.transaction_type,
                    item.epf_amount,
                    item.eps_amount,
                    item.employee_contribution,
                    item.employer_contribution,
                    item.pension_amount
                ],
                true
            );
            return ProvidentFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    async findAll(criteria: Criteria): Promise<ProvidentFundTransaction[]> {
        try {
            let findSQL = 'SELECT * FROM provident_fund';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IProvidentFundTransaction>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((mfTransaction) => ProvidentFundTransactionBuilder.buildFromEntity(mfTransaction));
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM provident_fund WHERE transaction_id = $1;', [id], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM provident_fund;', [], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[DeleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async update(item: ProvidentFundTransaction): Promise<ProvidentFundTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IProvidentFundTransaction>(
                `UPDATE provident_fund
                 SET wage_month=$1,
                     financial_year=$2,
                     transaction_date=$3,
                     description=$4,
                     transaction_type=$5,
                     epf_amount=$6,
                     eps_amount=$7,
                     employee_contribution=$8,
                     employer_contribution=$9,
                     pension_amount=$10
                 WHERE transaction_id = $11
                 RETURNING *`,
                [
                    item.wage_month,
                    item.financial_year,
                    item.transaction_date.toISOString(),
                    item.description,
                    item.transaction_type,
                    item.epf_amount,
                    item.eps_amount,
                    item.employee_contribution,
                    item.employer_contribution,
                    item.pension_amount,
                    item.transaction_id
                ],
                true
            );
            return ProvidentFundTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Delete ${error}`);
            return undefined;
        }
    }

    generateId = (item: ProvidentFundTransaction): string => {
        return item.financial_year + '_' + item.wage_month + '_' + item.transaction_date;
    };

    async findAllUsingGroupBy(criteria: Criteria) {
        try {
            let innerSql = `SELECT financial_year
                            FROM provident_fund`;
            let where = addWhereClause(innerSql, criteria);
            innerSql = where.sql;
            innerSql = addGroupByClause(innerSql, criteria);
            // innerSql = addOrderByClause(innerSql, criteria);
            innerSql = addLimitAndOffset(innerSql, criteria);
            let findSQL = `SELECT *
                           FROM provident_fund
                           WHERE financial_year IN (${innerSql})`;
            findSQL = addOrderByClause(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IProvidentFundTransaction>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((mfTransaction) => ProvidentFundTransactionBuilder.buildFromEntity(mfTransaction));
        } catch (error) {
            logger.error(`[FindAllUsingGroupBy] - Error On FindAllUsingGroupBy ${error}`);
            return [];
        }
    }

    async count(criteria: Criteria) {
        try {
            let innerSql = `SELECT DISTINCT SUM(1) OVER () as num_found
                            FROM provident_fund`;
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

export const providentFundRepository = new ProvidentFundRepository();
