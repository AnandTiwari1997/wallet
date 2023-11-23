import { Repository } from './repository.js';
import { Broker, BrokerBuilder, IBroker } from '../models/broker.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('BrokerRepository');

class BrokerRepository implements Repository<Broker, string> {
    async add(item: Broker): Promise<Broker | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBroker>(
                'INSERT INTO stock_broker(broker_id, broker_email_id, broker_name, broker_icon, broker_primary_color) VALUES($1, $2, $3, $4, $5) RETURNING *;',
                [item.broker_id, item.broker_email_id, item.broker_name, item.broker_icon, item.broker_primary_color],
                true
            );
            return BrokerBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM stock_broker WHERE broker_id = $1;', [id], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM stock_broker;', [], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[DeleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async find(id: string): Promise<Broker | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<Broker>('SELECT * FROM stock_broker WHERE broker_id = $1;', [id], false);
            return BrokerBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return undefined;
        }
    }

    async findAll(criteria: Criteria): Promise<Broker[]> {
        try {
            let findSQL = 'SELECT * FROM stock_broker';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<Broker>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((value) => BrokerBuilder.buildFromEntity(value));
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Broker): Promise<Broker | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBroker>(
                `UPDATE stock_broker
                 SET broker_name=$1,
                     broker_icon=$2,
                     broker_email_id=$3,
                     broker_primary_color=$4
                 WHERE broker_id = $5
                 RETURNING *`,
                [item.broker_name, item.broker_icon, item.broker_email_id, item.broker_primary_color, item.broker_id],
                true
            );
            return BrokerBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const brokerRepository = new BrokerRepository();
