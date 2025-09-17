import { addMonths, differenceInDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { Logger } from '../core/logger.js';
import { Bill } from '../database/models/bill.js';
import { billRepository } from '../database/repository/bill-repository.js';
import { ISyncHandler } from './sync-handler.js';

export enum BillStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID'
}

export enum BillLabel {
    ACTIVE = 'ACTIVE',
    DUE = 'DUE',
    UPCOMING = 'UPCOMING'
}

// Create a new Logger instance with the name 'BillsSyncHandler'
const logger = new Logger('BillsSyncHandler');

/**
 * Handles the synchronization of bills by updating their status based on the current date.
 * @implements {ISyncHandler<Bill>}
 */
export class BillsSyncHandler implements ISyncHandler<Bill> {
    /**
     * Synchronizes a single bill, updating its status and bill dates as needed.
     *
     * @param bill The bill to be synchronized.
     * @returns {boolean} - True if the bill was updated, false otherwise.
     * @private
     */
    private syncSingleBill(bill: Bill): boolean {
        // If the bill is set to auto_sync, skip it, as it's likely managed by another process.
        if (bill.auto_sync) return false;

        const currentDate = new Date();
        let needsUpdate = false;
        const nextBillDate = bill.next_bill_date;
        const isApproachingDueDate = differenceInDays(nextBillDate, currentDate) < 7;

        // Case 1: The bill's due date is upcoming (within 7 days) and it's before the due date.
        // The bill is marked as ACTIVE and UNPAID.
        if (isBefore(currentDate, nextBillDate) && isApproachingDueDate) {
            bill.label = BillLabel.ACTIVE;
            bill.bill_status = BillStatus.UNPAID;
            needsUpdate = true;
        }
        // Case 2: It's the bill's due date.
        // The bill's date is rolled over to the next month, and the previous bill date is updated.
        else if (isSameDay(currentDate, nextBillDate)) {
            bill.previous_bill_date = nextBillDate;
            bill.next_bill_date = addMonths(nextBillDate, 1);
            needsUpdate = true;
        }
        // Case 3: The bill is unpaid and past its previous due date.
        // The bill is marked as DUE.
        else if (bill.bill_status === BillStatus.UNPAID && isAfter(currentDate, bill.previous_bill_date)) {
            bill.label = BillLabel.DUE;
            needsUpdate = true;
        }

        // If any of the above conditions were met, update the bill in the database.
        if (needsUpdate) {
            billRepository.update(bill.bill_id, bill).then();
            return true;
        }

        return false;
    }

    /**
     * The syncer function iterates over a list of bills and updates their status based on the current date.
     * @param bills An array of Bill objects to be processed.
     */
    syncer(bills: Bill[]) {
        const syncPromises = bills.map((bill) => this.syncSingleBill(bill));
        Promise.allSettled(syncPromises).then((results) => {
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    if (result.value) {
                        const billName = bills[index].bill_name;
                        logger.info(`New bill for : ${billName}`);
                    }
                }
            });
        });
    }

    /**
     * The sync function is the main entry point for the synchronization process.
     * @param bills An array of Bill objects to be processed.
     * @param deltaSync A boolean indicating whether to perform a delta sync.
     */
    sync(bills: Bill[], deltaSync: boolean) {
        this.syncer(bills);
    }
}
