import { Repository } from './repository.js';
import { StockTransaction, StockTransactionBuilder } from '../models/stock-transaction.js';
import { addGroupByClause, addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';
import { Holding } from '../models/holding.js';
import { DematAccount } from '../models/demat-account.js';

const logger: Logger = new Logger('StockTransactionRepository');

class StockTransactionRepository implements Repository<StockTransaction, string> {
    async add(item: StockTransaction): Promise<StockTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<StockTransaction>(
                'INSERT INTO stock(transaction_id, holding, transaction_date, transaction_type, stock_quantity, stock_transaction_price, amount, dated, demat_account) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
                [
                    item.transaction_id,
                    item.holding.holding_id,
                    item.transaction_date,
                    item.transaction_type,
                    item.stock_quantity,
                    item.stock_transaction_price,
                    item.amount,
                    item.dated,
                    item.demat_account.account_bo_id
                ],
                true
            );
            return await this.find(queryResult.rows[0].transaction_id);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error} Id ${item.transaction_id}`);
            return;
        }
    }

    delete(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    deleteAll(): Promise<boolean> {
        return Promise.resolve(false);
    }

    async find(id: string): Promise<StockTransaction | undefined> {
        try {
            let findSQL = 'SELECT * FROM stock WHERE transaction_id = $1';
            let joinQuery = `SELECT a.*, b.*, d.*
                             FROM (${findSQL}) a
                                      INNER JOIN holding b ON a.holding = b.holding_id 
                                      INNER JOIN demat_account d ON a.demat_account = d.account_bo_id;`;
            let queryResult = await sqlDatabaseProvider.execute<StockTransaction & Holding & DematAccount>(joinQuery, [id], false);
            if (queryResult.rowCount === 0) return;
            return StockTransactionBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return;
        }
    }

    async findAll(criteria: Criteria): Promise<StockTransaction[]> {
        try {
            let findSQL = `SELECT * FROM stock`;
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let joinQuery = `SELECT a.*, b.*, d.*
                             FROM (${findSQL}) a
                                      INNER JOIN holding b ON a.holding = b.holding_id 
                                      INNER JOIN demat_account d ON a.demat_account = d.account_bo_id;`;
            let queryResults = await sqlDatabaseProvider.execute<StockTransaction & Holding & DematAccount>(findSQL, where.whereClauses, false);
            return queryResults.rows.map((row) => {
                return StockTransactionBuilder.buildFromEntity(row);
            });
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: StockTransaction): Promise<StockTransaction | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<StockTransaction>('UPDATE stock SET amount=$1 WHERE transaction_id=$2 RETURNING *', [item.amount, item.transaction_id], true);
            return await this.find(queryResult.rows[0].transaction_id);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }

    async findAllUsingGroupBy(criteria: Criteria) {
        try {
            let innerSql1 = `SELECT S.holding, SUM(CASE WHEN S.transaction_type = 'B' THEN S.stock_quantity ELSE 0 END) - SUM(CASE WHEN S.transaction_type = 'S' THEN S.stock_quantity ELSE 0 END) AS current_quantity FROM holding H INNER JOIN stock S ON H.holding_id = S.holding`;
            let where = addWhereClause(innerSql1, criteria, 'S');
            innerSql1 = `${where.sql} GROUP BY S.HOLDING`;
            let innerSql = `SELECT S.holding FROM (${innerSql1}) S WHERE S.current_quantity > 0`;
            innerSql = addGroupByClause(innerSql, criteria);
            innerSql = addOrderByClause(innerSql, criteria);
            innerSql = addLimitAndOffset(innerSql, criteria);
            let joinQuery = `SELECT a.*, b.*, d.*
                             FROM stock a
                                      INNER JOIN holding b ON a.holding = b.holding_id INNER JOIN demat_account d ON a.demat_account = d.account_bo_id`;
            joinQuery = `${joinQuery} WHERE b.holding_id IN (${innerSql})`;
            joinQuery = addOrderByClause(joinQuery, criteria, 'a');
            let queryResults = await sqlDatabaseProvider.execute<StockTransaction & Holding & DematAccount>(joinQuery, where.whereClauses, false);
            return queryResults.rows.map((row) => StockTransactionBuilder.buildFromEntity(row));
        } catch (error) {
            logger.error(`[FindAllUsingGroupBy] - Error On FindAllUsingGroupBy ${error}`);
            return [];
        }
    }

    async count(criteria: Criteria) {
        try {
            let sql = `SELECT S.holding, SUM(CASE WHEN S.transaction_type = 'B' THEN S.stock_quantity ELSE 0 END) - SUM(CASE WHEN S.transaction_type = 'S' THEN S.stock_quantity ELSE 0 END) AS current_quantity FROM holding H INNER JOIN stock S ON H.holding_id = S.holding`;
            let where = addWhereClause(sql, criteria);
            sql = where.sql;
            sql = `${sql} GROUP BY S.holding`;
            let innerSql = `SELECT DISTINCT SUM(1) OVER () as num_found
                            FROM (SELECT S.holding FROM (${sql}) S WHERE S.current_quantity > 0)`;
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

export const stockTransactionRepository = new StockTransactionRepository();
