import { Repository } from './repository.js';
import { DematAccount, DematAccountBuilder } from '../models/demat-account.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';
import { Broker } from '../models/broker.js';

const logger: Logger = new Logger('DematAccountRepository');

class DematAccountRepository implements Repository<DematAccount, string> {
    async add(item: DematAccount): Promise<DematAccount | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<DematAccount>(
                'INSERT INTO demat_account(account_bo_id, account_name, account_client_id, broker, start_date, last_synced_on) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
                [item.account_bo_id, item.account_name, item.account_client_id, item.broker.broker_id, item.start_date, item.last_synced_on],
                true
            );
            return await this.find(queryResult.rows[0].account_bo_id);
        } catch (error) {
            logger.error(`[add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM demat_account WHERE account_bo_id = $1;', [id], true);
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[delete] - Error On delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM demat_account;', [], true);
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[deleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async find(id: string): Promise<DematAccount | undefined> {
        try {
            let findSQL = 'SELECT * FROM demat_account WHERE account_bo_id = $1';
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN stock_broker b ON a.broker = b.broker_id`;
            let queryResult = await sqlDatabaseProvider.execute<DematAccount & Broker>(joinQuery, [id], false);
            return DematAccountBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[find] - Error On Find ${error}`);
            return undefined;
        }
    }

    async findAll(criteria: Criteria): Promise<DematAccount[]> {
        try {
            let findSQL = 'SELECT * FROM demat_account';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN stock_broker b ON a.broker = b.broker_id`;
            let queryResult = await sqlDatabaseProvider.execute<DematAccount & Broker>(joinQuery, where.whereClauses, false);
            return queryResult.rows.map((account) => DematAccountBuilder.buildFromEntity(account));
        } catch (error) {
            logger.error(`[findAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: DematAccount): Promise<DematAccount | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<DematAccount>(
                'UPDATE demat_account SET account_name=$1, broker=$2, last_synced_on=$3 WHERE account_bo_id=$4 RETURNING *',
                [item.account_name, item.broker.broker_id, item.last_synced_on, item.account_bo_id],
                true
            );
            return await this.find(queryResult.rows[0].account_bo_id);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const dematAccountRepository = new DematAccountRepository();
