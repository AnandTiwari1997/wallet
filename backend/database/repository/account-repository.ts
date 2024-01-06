import { Repository } from './repository.js';
import { Account, AccountBuilder } from '../models/account.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';
import { Bank } from '../models/bank.js';

const logger: Logger = new Logger('AccountRepository');

class AccountRepository implements Repository<Account, number> {
    static rowCount: number = 1;

    setCurrentRowIndex(index: number) {
        AccountRepository.rowCount = index;
    }

    async add(item: Account): Promise<Account | undefined> {
        item.account_id = AccountRepository.rowCount++;
        try {
            let queryResult = await sqlDatabaseProvider.execute<Account>(
                'INSERT INTO account(account_id, account_name, account_balance, account_number, account_type, bank, start_date, last_synced_on, search_text) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
                [
                    AccountRepository.rowCount++,
                    item.account_name,
                    item.account_balance,
                    item.account_number,
                    item.account_type,
                    item.bank ? item.bank.bank_id : 0,
                    item.start_date,
                    item.last_synced_on,
                    item.search_text
                ],
                true
            );
            return await this.find(queryResult.rows[0].account_id);
        } catch (error) {
            logger.error(`[add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM account WHERE account_id = $1;', [id], true);
            AccountRepository.rowCount--;
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[delete] - Error On delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM account;', [], true);
            AccountRepository.rowCount = 0;
            return queryResult.rows[0] !== undefined;
        } catch (error) {
            logger.error(`[deleteAll] - Error On DeleteAll ${error}`);
            return false;
        }
    }

    async find(id: number): Promise<Account | undefined> {
        try {
            let findSQL = 'SELECT * FROM account WHERE account_id = $1';
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN bank b ON a.bank = b.bank_id`;
            let queryResult = await sqlDatabaseProvider.execute<Account & Bank>(joinQuery, [id], false);
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
            let joinQuery = `SELECT a.*, b.*
                             FROM (${findSQL}) a
                                      INNER JOIN bank b ON a.bank = b.bank_id`;
            let queryResult = await sqlDatabaseProvider.execute<Account & Bank>(joinQuery, where.whereClauses, false);
            return queryResult.rows.map((account) => AccountBuilder.buildFromEntity(account));
        } catch (error) {
            logger.error(`[findAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Account): Promise<Account | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<Account>(
                'UPDATE account SET account_name=$1, account_balance=$2, account_number=$3, account_type=$4, bank=$5, last_synced_on=$6, search_text=$7 WHERE account_id=$8 RETURNING *',
                [item.account_name, item.account_balance, item.account_number, item.account_type, item.bank ? item.bank.bank_id : 0, item.last_synced_on, item.search_text, item.account_id],
                true
            );
            return await this.find(queryResult.rows[0].account_id);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const accountRepository = new AccountRepository();
