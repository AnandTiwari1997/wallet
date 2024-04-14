import { addMonths, differenceInDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { Logger } from '../core/logger.js';
import { Bill } from '../database/models/bill.js';
import { billRepository } from '../database/repository/bill-repository.js';
import { ISyncHandler } from './sync-handler.js';

const logger = new Logger('BillsSyncHandler');

export class BillsSyncHandler implements ISyncHandler<Bill> {
    syncer(bills: Bill[]) {
        bills.forEach((bill) => {
            if (bill.auto_sync) return;
            let currentDate = new Date();
            let nextBillDate = bill.next_bill_date;
            let diffDays = differenceInDays(nextBillDate, currentDate) < 7;
            if (isBefore(currentDate, nextBillDate) && diffDays) {
                bill.label = 'ACTIVE';
                bill.bill_status = 'UNPAID';
                billRepository.update(bill.bill_id, bill);
                return;
            }
            if (isSameDay(currentDate, nextBillDate)) {
                bill.previous_bill_date = nextBillDate;
                bill.next_bill_date = addMonths(nextBillDate, 1);
                billRepository.update(bill.bill_id, bill);
                return;
            }
            let status = bill.bill_status;
            if (status === 'UNPAID' && isAfter(currentDate, bill.previous_bill_date)) {
                bill.label = 'DUE';
                billRepository.update(bill.bill_id, bill);
                return;
            }
            logger.debug('No New Bills.');
        });
    }

    sync(bills: Bill[], deltaSync: boolean) {
        this.syncer(bills);
        // bills.forEach((bill) => {
        //     if (bill.category !== 'INTERNET_BILL') return;
        //     if (bill.label === 'ACTIVE') {
        //         if (isBefore(new Date(), addDays(bill.previous_bill_date, 10))) {
        //             bill.label = 'DUE';
        //             billRepository.update(bill.bill_id, bill).then();
        //             return;
        //         }
        //     }
        //     let syncDate: Date = new Date();
        //     if (isBefore(syncDate, bill.next_bill_date)) return;
        //     connection.search(
        //         [
        //             ['SINCE', bill.next_bill_date],
        //             ['SUBJECT', bill.bill_consumer_no]
        //         ],
        //         (error, uids) => {
        //             if (error) {
        //                 logger.error(error.message);
        //                 return;
        //             }
        //             if (uids.length === 0) return;
        //             const iFetch = connection.fetch(uids, {
        //                 bodies: ''
        //             });
        //             iFetch.on('message', function (msg, sequenceNumber) {
        //                 msg.once('body', function (stream, info) {
        //                     simpleParser(stream, async (error, parsedMail) => {
        //                         if (error) {
        //                             logger.error(error.message);
        //                             return;
        //                         }
        //                         if (!parsedMail.from?.text) return;
        //                         let billProcessor = ProcessorFactory.getProcessor(parsedMail.from?.text, undefined);
        //                         if (billProcessor) {
        //                             let updatedBill = billProcessor.processMail(parsedMail, bill);
        //                             if (updatedBill) billRepository.update(bill.bill_id, bill).then();
        //                         }
        //                     });
        //                 });
        //             });
        //             iFetch.on('error', (error) => {
        //                 logger.error(`Error On Processing Mail ${error.message}`);
        //             });
        //             iFetch.on('end', () => {
        //                 logger.info(`Message has been processed`);
        //             });
        //         }
        //     );
        // });
        // (async () => {
        //     for (let bill of bills) {
        //         if (bill.category !== 'ELECTRICITY_BILL') continue;
        //         if (bill.label === 'ACTIVE') continue;
        //         let billProcessor = ElectricityBillProcessorFactory.getProcessor(
        //             electricityVendorMap[bill.vendor_name]
        //         );
        //         if (!billProcessor) continue;
        //         let driver = await getFirefoxWebDriver('', true);
        //         let result = await billProcessor.process(bill.bill_consumer_no, driver);
        //         if (result) {
        //             if (isAfter(result.billDueDate, bill.previous_bill_date)) {
        //                 bill.bill_amount = result.billAmount;
        //                 bill.previous_bill_date = result.billDueDate;
        //                 bill.next_bill_date = result.billDueDate;
        //                 bill.label = 'ACTIVE';
        //                 bill.bill_status = 'UNPAID';
        //                 await billRepository.update(bill.bill_id, bill);
        //             }
        //         }
        //     }
        // })();
        // (async () => {
        //     for (let bill of bills) {
        //         if (bill.category !== 'CREDIT_CARD_BILL') continue;
        //         if (bill.label === 'ACTIVE') {
        //             if (isBefore(new Date(), addDays(bill.previous_bill_date, 15))) {
        //                 bill.label = 'DUE';
        //                 billRepository.update(bill.bill_id, bill).then();
        //                 continue;
        //             }
        //         }
        //         let syncDate: Date = new Date();
        //         if (isBefore(syncDate, bill.next_bill_date)) continue;
        //         connection.search(
        //             [
        //                 ['SINCE', subMonths(bill.next_bill_date, 1)],
        //                 ['SUBJECT', bill.bill_consumer_no]
        //             ],
        //             (error, uids) => {
        //                 if (error) {
        //                     logger.error(error.message);
        //                     return;
        //                 }
        //                 if (uids.length === 0) return;
        //                 const iFetch = connection.fetch(uids, {
        //                     bodies: ''
        //                 });
        //                 iFetch.on('message', function (msg, sequenceNumber) {
        //                     msg.once('body', function (stream, info) {
        //                         simpleParser(stream, async (error, parsedMail) => {
        //                             if (error) {
        //                                 logger.error(error.message);
        //                                 return;
        //                             }
        //                             if (!parsedMail.from?.text) return;
        //                             let billProcessor = CreditCardBillProcessorFactory.getProcessor(
        //                                 parsedMail.from?.text
        //                             );
        //                             if (billProcessor) {
        //                                 let updatedBill = billProcessor.process(parsedMail, bill);
        //                                 if (updatedBill) billRepository.update(bill.bill_id, bill).then();
        //                             }
        //                         });
        //                     });
        //                 });
        //                 iFetch.on('error', (error) => {
        //                     logger.error(`Error On Processing Mail ${error.message}`);
        //                 });
        //                 iFetch.on('end', () => {
        //                     logger.info(`Message has been processed`);
        //                 });
        //             }
        //         );
        //     }
        // })();
    }
}
