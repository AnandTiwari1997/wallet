import { Bill, BillBuilder, IBill } from '../models/bill.js';
import { Repository } from './repository.js';
import { addLimitAndOffset, addOrderByClause, addWhereClause, Criteria } from './storage.js';
import { sqlDatabaseProvider } from '../initialize-database.js';
import { Logger } from '../../core/logger.js';
import { randomUUID } from 'crypto';

const logger: Logger = new Logger('BillRepository');

class BillRepository implements Repository<Bill, string> {
    async add(item: Bill): Promise<Bill | undefined> {
        try {
            item.bill_id = randomUUID();
            let queryResult = await sqlDatabaseProvider.execute<IBill>(
                'INSERT INTO bill(bill_id, bill_name, vendor_name, bill_status, label, category, previous_bill_date, next_bill_date, transaction_date, auto_sync, bill_amount, bill_consumer_no) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;',
                [
                    item.bill_id,
                    item.bill_name,
                    item.vendor_name,
                    item.bill_status,
                    item.label,
                    item.category,
                    item.previous_bill_date,
                    item.next_bill_date,
                    item.transaction_date,
                    item.auto_sync,
                    item.bill_amount,
                    item.bill_consumer_no
                ],
                true
            );
            return BillBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Add] - Error On Add ${error}`);
            return;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM bill WHERE bill_id = $1;', [id], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async deleteAll(): Promise<boolean> {
        try {
            let queryResult = await sqlDatabaseProvider.execute('DELETE FROM bill;', [], true);
            return queryResult.rows.length > 0;
        } catch (error) {
            logger.error(`[Delete] - Error On Delete ${error}`);
            return false;
        }
    }

    async find(id: string): Promise<Bill | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBill>('SELECT * FROM bill WHERE bill_id = $1;', [id], false);
            if (!queryResult.rows[0]) return;
            return BillBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Find] - Error On Find ${error}`);
            return;
        }
    }

    async findAll(criteria: Criteria): Promise<Bill[]> {
        try {
            let findSQL = 'SELECT * FROM bill';
            let where = addWhereClause(findSQL, criteria);
            findSQL = where.sql;
            findSQL = addOrderByClause(findSQL, criteria);
            findSQL = addLimitAndOffset(findSQL, criteria);
            let queryResult = await sqlDatabaseProvider.execute<IBill>(findSQL, where.whereClauses, false);
            return queryResult.rows.map((bill) => BillBuilder.buildFromEntity(bill));
        } catch (error) {
            logger.error(`[FindAll] - Error On FindAll ${error}`);
            return [];
        }
    }

    async update(item: Bill): Promise<Bill | undefined> {
        try {
            let queryResult = await sqlDatabaseProvider.execute<IBill>(
                'UPDATE bill SET bill_name=$1, vendor_name=$2, bill_status=$3, label=$4, category=$5, previous_bill_date=$6, next_bill_date=$7, transaction_date=$8, auto_sync=$9, bill_amount=$10, bill_consumer_no=$11 WHERE bill_id=$12 RETURNING *;',
                [
                    item.bill_name,
                    item.vendor_name,
                    item.bill_status,
                    item.label,
                    item.category,
                    item.previous_bill_date,
                    item.next_bill_date,
                    item.transaction_date,
                    item.auto_sync,
                    item.bill_amount,
                    item.bill_consumer_no,
                    item.bill_id
                ],
                true
            );
            return BillBuilder.buildFromEntity(queryResult.rows[0]);
        } catch (error) {
            logger.error(`[Update] - Error On Update ${error}`);
            return;
        }
    }
}

export const billRepository = new BillRepository();
