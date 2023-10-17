import { SyncProvider } from './sync-provider.js';
import { billRepository } from '../../database/repository/bill-repository.js';
import { addMonths, differenceInDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { Logger } from '../../core/logger.js';
import { Account } from '../../database/models/account.js';

const logger = new Logger('BillsSyncProvider');

class BillsSyncProvider implements SyncProvider {
    syncer() {
        billRepository.findAll({}).then((bills) => {
            bills.forEach((bill) => {
                let currentDate = new Date();
                let nextBillDate = bill.next_bill_date;
                let diffDays = differenceInDays(nextBillDate, currentDate) < 7;
                if (isBefore(currentDate, nextBillDate) && diffDays) {
                    bill.label = 'ACTIVE';
                    bill.bill_status = 'UNPAID';
                    billRepository.update(bill);
                    return;
                }
                if (isSameDay(currentDate, nextBillDate)) {
                    bill.label = 'ACTIVE';
                    bill.previous_bill_date = nextBillDate;
                    bill.next_bill_date = addMonths(nextBillDate, 1);
                    billRepository.update(bill);
                    return;
                }
                let status = bill.bill_status;
                if (status === 'UNPAID' && isAfter(currentDate, bill.previous_bill_date)) {
                    bill.label = 'DUE';
                    billRepository.update(bill);
                    return;
                }
                logger.debug('No New Bills.');
            });
        });
    }

    sync(): void {
        this.syncer();
        setInterval(this.syncer.bind(this), 1000 * 60 * 60 * 24);
    }

    manualSync(accounts: Account[], deltaSync: boolean) {
        this.syncer();
    }
}

export const billSyncProvider = new BillsSyncProvider();
