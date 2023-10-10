import Sqlite3 from 'sqlite3';
import { migrations } from './migration.js';
import { Logger } from '../core/logger.js';
import pkg, { PoolClient } from 'pg';
import { bankRepository } from './repository/bank-repository.js';
import { accountRepository } from './repository/account-repository.js';
import { dbParam } from '../config.js';

const { Pool } = pkg;
const logger: Logger = new Logger('DatabaseProvider');

class DatabaseProvider {
    database: Sqlite3.Database | undefined;
    pool: any;

    constructor() {
        this.pool = new Pool({
            host: dbParam.host,
            database: dbParam.name,
            user: dbParam.user,
            password: dbParam.password,
            max: dbParam.poolSize,
            idleTimeoutMillis: dbParam.idleTimeoutMillis,
            connectionTimeoutMillis: dbParam.connectionTimeoutMillis,
            port: dbParam.port
        });
        logger.info('Database Connected');
        this.pool.on('release', (err: Error, client: PoolClient) => logger.debug(`Connection Released`));
        this.pool.on('connect', (client: PoolClient) => logger.debug(`Database Client Connected`));
        this.getClient().then(async (client: PoolClient) => {
            await client.query(`CREATE TABLE IF NOT EXISTS migration
                                (
                                    id  TEXT PRIMARY KEY NOT NULL,
                                    sql TEXT             NOT NULL
                                );`);
            let queryResult = await client.query<{ id: string }>('SELECT id FROM migration');
            let stringArray = queryResult.rows.map((value) => value.id);
            await this.runMigrations(client, stringArray);
            logger.debug('Migrations Successfully Applied');
            let countQueryResult = await client.query<{ count: number }>(`SELECT COUNT(*) as count
                                                                          FROM bank`);
            bankRepository.setCurrentRowIndex(countQueryResult.rows[0].count);
            countQueryResult = await client.query<{ count: number }>(`SELECT COUNT(*) as count
                                                                      FROM account`);
            accountRepository.setCurrentRowIndex(countQueryResult.rows[0].count);
            this.releaseClient(client);
        });
    }

    async runMigrations(client: PoolClient, ids: string[]) {
        for (const key of Object.keys(migrations)) {
            if (ids.includes(key)) continue;
            await client.query(migrations[key]);
            await this.execute<any>('INSERT INTO migration(id, sql) VALUES ($1, $2);', [key, migrations[key]], true);
            logger.debug(`Migrations Successful for ${key}`);
        }
    }

    getClient() {
        return this.pool.connect();
    }

    releaseClient(client: PoolClient) {
        client.release();
    }

    closeDatabase() {
        this.database?.close((error) => {
            logger.info('SQLite Connection Closed');
        });
    }

    async execute<T extends pkg.QueryResultRow>(text: string, params: any[], transactional: boolean) {
        const start = Date.now();
        const client: PoolClient = await this.getClient();
        try {
            if (transactional) await client.query('BEGIN');
            const queryResult = await client.query<T>(text, params);
            const duration = Date.now() - start;
            if (transactional) await client.query('COMMIT');
            logger.debug(`Took ${duration}s to fetch ${queryResult.rowCount} records for query ${text}`);
            return queryResult;
        } catch (e) {
            if (transactional) await client.query('ROLLBACK');
            logger.error(`Query Error: ${e}`);
            throw e;
        } finally {
            this.releaseClient(client);
        }
    }
}

export const sqlDatabaseProvider = new DatabaseProvider();
