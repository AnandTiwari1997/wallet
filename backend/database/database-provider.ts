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

const logger: Logger = new Logger('DatabaseProvider');

class DatabaseProvider {
    database: DataSource;

    constructor() {
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
                StockTransaction
            ]
        });
        this.database.driver.connect().then(() => {
            logger.info('[TypeORM]: Database Connected');
            this.database
                .initialize()
                .then(async (value) => {
                    const queryRunner = value.createQueryRunner();
                    await queryRunner.connect();
                    await queryRunner.query(`CREATE TABLE IF NOT EXISTS migration
                                (
                                    id  TEXT PRIMARY KEY NOT NULL,
                                    sql TEXT             NOT NULL
                                );`);
                    let queryResult = await queryRunner.query('SELECT id FROM migration');
                    let stringArray = queryResult.map((value: { id: string }) => value.id);
                    await this.runMigrations(value, stringArray);
                    logger.info('[TypeORM]: Migrations Successfully Applied');
                    await queryRunner.release();
                })
                .catch((err) => {
                    console.error('[TypeORM]: Error during Data Source initialization', err);
                });
        });
    }

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

export const databaseProvider = new DatabaseProvider();
