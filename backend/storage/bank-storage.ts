import { Database } from '../database/database.js';
import { Bank } from '../models/bank.js';
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
        const bank = await this.find(item.id);
        if (bank) return bank;
        item.id = BankStorage.rowCount++;
        return new Promise((resolve, reject) => {
            sqlDatabaseProvider.database?.run(
                'INSERT INTO bank(id, name, icon, alertEmailId, primaryColor) VALUES(?, ?, ?, ?, ?);',
                [item.id, item.name, item.icon, item.alert_email_id, item.primary_color],
                (error) => {
                    if (error) {
                        logger.error(`[Add] - Error On Add ${error.message}`);
                        reject(error);
                        return;
                    }
                    resolve(item);
                }
            );
        });
    }

    delete(id: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM bank WHERE id = ?;', id, (error) => {
                if (error) {
                    logger.error(`[Delete] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                BankStorage.rowCount--;
            });
        });
    }

    deleteAll(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sqlDatabaseProvider.database?.run('DELETE FROM bank;', (error) => {
                if (error) {
                    logger.error(`[DeleteAll] - Error On Delete ${error.message}`);
                    resolve(false);
                    return;
                }
                resolve(true);
                BankStorage.rowCount = 0;
            });
        });
    }

    async find(id: number): Promise<Bank | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<Bank>('SELECT * FROM bank WHERE id = $1;', [id], false);
            return queryResult.rows[0];
        } catch (error) {
            logger.error(`[find] - Error On Find ${error}`);
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
            let queryResult = await sqlDatabaseProvider.execute<Bank>(findSQL, where.whereClauses, false);
            return queryResult.rows;
        } catch (error) {
            logger.error(`[findAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Bank): Promise<Bank | undefined> {
        let bankPromise = this.find(item.id);
        return bankPromise
            .then((bank) => {
                if (bank) {
                    let deletePromise = this.delete(bank.id);
                    return deletePromise.then((deleted) => {
                        if (deleted) {
                            return this.add(item);
                        }
                        return undefined;
                    });
                }
                return undefined;
            })
            .catch((reason) => {
                logger.error(`[Update] - Error On Delete ${reason}`);
                return undefined;
            });
    }
}

export const bankStorage = new BankStorage();
