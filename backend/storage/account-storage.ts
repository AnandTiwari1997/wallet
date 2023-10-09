import { Database } from '../database/database.js';
import { Account, AccountBuilder, IAccount } from '../models/account.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../database/initialize-database.js';
import { Logger } from '../logger/logger.js';

const logger: Logger = new Logger('AccountStorage');

class AccountStorage implements Database<Account, number> {
    static rowCount: number = 1;

    setCurrentRowIndex(index: number) {
        AccountStorage.rowCount = index;
    }

    async add(item: Account): Promise<Account | undefined> {
        item.account_id = AccountStorage.rowCount++;
        let accountPromise = this.find(item.account_id);
        const account = await accountPromise;
        if (account) return account;
        try {
            let queryResult = await sqlDatabaseProvider.execute<IAccount>(
                'INSERT INTO account(account_id, account_name, account_balance, initial_balance, bank_account_number, account_type, account_icon, account_background_color, bank_account_type, bank, last_synced_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;',
                [
                    item.account_id,
                    item.account_name,
                    item.account_balance,
                    item.initial_balance,
                    item.bank_account_number,
                    item.account_type,
                    item.account_icon,
                    item.account_background_color,
                    item.bank_account_type,
                    item.bank ? item.bank.bank_id : 0,
                    item.last_synced_on
                ],
                true
            );
            return AccountBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM account WHERE account_id = $1;', [id], true);
            AccountStorage.rowCount--;
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[delete] - Error On delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM account;', [], true);
            AccountStorage.rowCount = 0;
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[deleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async find(id: number): Promise<Account | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IAccount>('SELECT * FROM account WHERE account_id = $1;', [id], false);
            return AccountBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[find] - Error On Find ${error}`);
            return undefined;
        }
    }

    async findAll(criteria: Criteria): Promise<Account[]> {
        try {
            let findSQL = 'SELECT * FROM account';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IAccount>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((account) => AccountBuilder.buildFromEntity(account));
        } catch (error) {
            logger.error(`[findAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Account): Promise<Account | undefined> {
        try {
            logger.info(item);
            let queryResult = await sqlDatabaseProvider.execute<IAccount>(
                'UPDATE account SET account_name=$1, account_balance=$2, initial_balance=$3, bank_account_number=$4, account_type=$5, account_icon=$6, account_background_color=$7, bank_account_type=$8, bank=$9, last_synced_on=$10 WHERE account_id=$11 RETURNING *',
                [
                    item.account_name,
                    item.account_balance,
                    item.initial_balance,
                    item.bank_account_number,
                    item.account_type,
                    item.account_icon,
                    item.account_background_color,
                    item.bank_account_type,
                    item.bank ? item.bank.bank_id : 0,
                    item.last_synced_on,
                    item.account_id
                ],
                true
            );
            return AccountBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }

    async findAllWithRelation(criteria: Criteria) {
        let findSQL = 'SELECT * FROM account';
        let where = addWhereClause(findSQL, criteria);
        findSQL = where.sql;
        findSQL = addOrderByClause(findSQL, criteria);
        findSQL = addLimitAndOffset(findSQL, criteria);
        let joinQuery = `SELECT a.*, b.*
                         FROM (${findSQL}) a
                                  INNER JOIN bank b ON a.bank = b.bank_id`;
        let queryResult = await sqlDatabaseProvider.execute<IAccount>(joinQuery, where.whereClauses, false);
        return queryResult.rows.map((account) => AccountBuilder.buildFromEntity(account));
    }
}

export const accountStorage = new AccountStorage();
