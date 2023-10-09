import { Database } from '../database/database.js';
import { Bank, IBank } from '../models/bank.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('BankStorage');

class BankStorage implements Database<Bank, number> {
    static rowCount: number = 1;

    setCurrentRowIndex(index: number) {
        BankStorage.rowCount = index;
    }

    async add(item: Bank): Promise<Bank | undefined> {
        try {
            const bank = await this.find(item.bank_id);
            if (bank) return bank;
            item.bank_id = BankStorage.rowCount++;
            let queryResult = await sqlDatabaseProvider.execute<IBank>(
                `INSERT INTO bank(bank_id, name, icon, alert_email_id, primary_color)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *;`,
                [item.bank_id, item.name, item.icon, item.alert_email_id, item.primary_color],
                true
            );
            return queryResult.rows[0];
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM bank WHERE bank_id = $1;', [id], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM bank;', [], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[DeleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async find(id: number): Promise<Bank | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBank>('SELECT * FROM bank WHERE bank_id = $1;', [id], false);
            return queryResult.rows[0];
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return undefined;
        }
    }

    async findAll(criteria: Criteria): Promise<Bank[]> {
        try {
            let findSQL = 'SELECT * FROM bank';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IBank>(findSQL, where.whereClauses, false);
            return queryResult.rows;
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Bank): Promise<Bank | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBank>(
                `UPDATE bank
                 SET name=$1,
                     icon=$2,
                     alert_email_id=$3,
                     primary_color=$4
                 WHERE bank_id = $5
                 RETURNING *`,
                [item.name, item.icon, item.alert_email_id, item.primary_color, item.bank_id],
                true
            );
            return queryResult.rows[0];
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const bankStorage = new BankStorage();
