import { migrations } from './migration.js';
import { Logger } from '../core/logger.js';
import { dbParam } from '../config.js';
import { DataSource } from 'typeorm';
import { Account } from './models/account.js';
import { Bank } from './models/bank.js';
import { DematAccount } from './models/demat-account.js';
import { AccountTransaction } from './models/account-transaction.js';
import { Broker } from './models/broker.js';
import { StockTransaction } from './models/stock-transaction.js';
import { Holding } from './models/holding.js';
import { ProvidentFundTransaction } from './models/provident-fund-transaction.js';
import { MutualFundTransaction } from './models/mutual-fund-transaction.js';
import { Bill } from './models/bill.js';
import { Consent } from './models/consent.js';
import { eventEmitter } from '../server.js';

const logger: Logger = new Logger('DatabaseProvider');

/**
 * The DatabaseProvider class is responsible for managing the database connection and running migrations.
 */
class DatabaseProvider {
    database: DataSource;

    constructor() {
        // Initialize the data source with the connection options.
        this.database = new DataSource({
            type: 'postgres',
            host: dbParam.host,
            port: dbParam.port,
            username: dbParam.user,
            password: dbParam.password,
            database: dbParam.name,
            logging: dbParam.loggingEnabled,
            entities: [
                Broker,
                DematAccount,
                Bank,
                Account,
                AccountTransaction,
                Bill,
                ProvidentFundTransaction,
                MutualFundTransaction,
                Holding,
                StockTransaction,
                Consent
            ]
        });
        // Connect to the database and run migrations.
        this.database.driver.connect().then(() => {
            logger.info('[TypeORM]: Database Connected');
            this.database
                .initialize()
                .then(async (value) => {
                    const queryRunner = value.createQueryRunner();
                    await queryRunner.connect();
                    // Create the migration table if it doesn't exist.
                    await queryRunner.query(`CREATE TABLE IF NOT EXISTS migration
                                (
                                    id  TEXT PRIMARY KEY NOT NULL,
                                    sql TEXT             NOT NULL
                                );`);
                    // Get the list of executed migrations.
                    let queryResult = await queryRunner.query('SELECT id FROM migration');
                    let stringArray = queryResult.map((value: { id: string }) => value.id);
                    // Run the pending migrations.
                    await this.runMigrations(value, stringArray);
                    logger.info('[TypeORM]: Migrations Successfully Applied');
                    await queryRunner.release();
                    eventEmitter.emit('db_initialized');
                })
                .catch((err) => {
                    console.error('[TypeORM]: Error during Data Source initialization', err);
                });
        });
    }

    /**
     * Runs the database migrations.
     * @param client The TypeORM data source.
     * @param ids The IDs of the migrations that have already been run.
     */
    async runMigrations(client: DataSource, ids: string[]) {
        for (const key of Object.keys(migrations)) {
            if (ids.includes(key)) continue;
            await client.transaction(async (transactionalEntityManager) => {
                await client.query(migrations[key]);
                await client.query('INSERT INTO migration(id, sql) VALUES ($1, $2);', [key, migrations[key]]);
                logger.info(`[TypeORM]: Migrations Successful for ${key}`);
            });
        }
    }
}

// Create a singleton instance of the DatabaseProvider.
export const databaseProvider = new DatabaseProvider();
