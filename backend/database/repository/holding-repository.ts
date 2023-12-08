import { Repository } from './repository.js';
import { Holding, HoldingBuilder } from '../models/holding.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('HoldingRepository');

class HoldingRepository implements Repository<Holding, string> {
    async add(item: Holding): Promise<Holding | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<Holding>(
                'INSERT INTO holding(holding_id, stock_name, stock_isin, stock_symbol_code, stock_symbol, stock_exchange, current_price, total_shares, invested_amount, account_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (holding_id) DO UPDATE SET current_price=$7 RETURNING *;',
                [
                    item.holding_id,
                    item.stock_name,
                    item.stock_isin,
                    item.stock_symbol_code,
                    item.stock_symbol,
                    item.stock_exchange,
                    item.current_price,
                    item.total_shares,
                    item.invested_amount,
                    item.account_id
                ],
                true
            );
            return await this.find(queryResult.rows[0].holding_id);
        } catch (error) {
            logger.error(`[add] - Error On Add ${error}`);
            return;
        }
    }

    delete(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    deleteAll(): Promise<boolean> {
        return Promise.resolve(false);
    }

    async find(id: string): Promise<Holding | undefined> {
        try {
            let findSQL = 'SELECT * FROM holding WHERE holding_id = $1';
            let queryResult = await sqlDatabaseProvider.execute<Holding>(findSQL, [id], false);
            return HoldingBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[find] - Error On Find ${error}`);
            return undefined;
        }
    }

    async findAll(criteria: Criteria): Promise<Holding[]> {
        try {
            let findSQL = 'SELECT * FROM holding';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<Holding>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((holding) => HoldingBuilder.buildFromEntity(holding));
        } catch (error) {
            logger.error(`[find] - Error On Find ${error}`);
            return [];
        }
    }

    async update(item: Holding): Promise<Holding | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<Holding>(
                'UPDATE holding SET current_price=$1, total_shares=$2, invested_amount=$3, stock_exchange=$4 WHERE holding_id=$5 RETURNING *',
                [item.current_price, item.total_shares, item.invested_amount, item.stock_exchange, item.holding_id],
                true
            );
            return await this.find(queryResult.rows[0].holding_id);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const holdingRepository = new HoldingRepository();
