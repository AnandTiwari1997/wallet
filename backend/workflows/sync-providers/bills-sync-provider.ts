import { SyncProvider } from './sync-provider.js';
import { billRepository } from '../../database/repository/bill-repository.js';
import { addDays, addMonths, differenceInDays, isAfter, isBefore, isSameDay, subMonths } from 'date-fns';
import { Logger } from '../../core/logger.js';
import { connection } from '../mail-service.js';
import { Bill } from '../../database/models/bill.js';
import { simpleParser } from 'mailparser';
import { BillProcessorFactory } from '../processor/bill-processor.js';
import { getFirefoxWebDriver } from '../web-driver-util.js';
import { CreditCardBillProcessorFactory, ElectricityBillProcessorFactory } from '../processor/processors.js';
import { electricityVendorMap } from '../../config.js';

const logger = new Logger('BillsSyncProvider');

class BillsSyncProvider implements SyncProvider<Bill> {
    syncer(bills: Bill[]) {
        bills.forEach((bill) => {
            if (bill.auto_sync) return;
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
    }

    sync(): void {
        billRepository.findAll({}).then((bills: Bill[]) => {
            this.manualSync(bills, false);
        });
        setInterval(this.sync.bind(this), 1000 * 60 * 60 * 24);
    }

    manualSync(bills: Bill[], deltaSync: boolean) {
        this.syncer(bills);
        bills.forEach((bill) => {
            if (bill.category !== 'INTERNET_BILL') return;
            if (bill.label === 'ACTIVE') {
                if (isBefore(new Date(), addDays(bill.previous_bill_date, 10))) {
                    bill.label = 'DUE';
                    billRepository.update(bill).then();
                    return;
                }
            }
            let syncDate: Date = new Date();
            if (isBefore(syncDate, bill.next_bill_date)) return;
            connection.search(
                [
                    ['SINCE', bill.next_bill_date],
                    ['SUBJECT', bill.bill_consumer_no]
                ],
                (error, uids) => {
                    if (error) {
                        logger.error(error.message);
                        return;
                    }
                    if (uids.length === 0) return;
                    const iFetch = connection.fetch(uids, {
                        bodies: ''
                    });
                    iFetch.on('message', function (msg, sequenceNumber) {
                        msg.once('body', function (stream, info) {
                            simpleParser(stream, async (error, parsedMail) => {
                                if (error) {
                                    logger.error(error.message);
                                    return;
                                }
                                if (!parsedMail.from?.text) return;
                                let billProcessor = BillProcessorFactory.getProcessor(parsedMail.from?.text);
                                if (billProcessor) {
                                    let updatedBill = billProcessor.process(parsedMail, bill);
                                    if (updatedBill) billRepository.update(bill).then();
                                }
                            });
                        });
                    });
                    iFetch.on('error', (error) => {
                        logger.error(`Error On Processing Mail ${error.message}`);
                    });
                    iFetch.on('end', () => {
                        logger.info(`Message has been processed`);
                    });
                }
            );
        });
        (async () => {
            for (let bill of bills) {
                if (bill.category !== 'ELECTRICITY_BILL') continue;
                if (bill.label === 'ACTIVE') continue;
                let billProcessor = ElectricityBillProcessorFactory.getProcessor(electricityVendorMap[bill.vendor_name]);
                if (!billProcessor) continue;
                let driver = await getFirefoxWebDriver('', true);
                let result = await billProcessor.process(bill.bill_consumer_no, driver);
                // logger.info(`Received following for consumer`, bill.bill_consumer_no, ':', result?.billAmount, result?.billDueDate);
                if (result) {
                    if (isAfter(result.billDueDate, bill.previous_bill_date)) {
                        bill.bill_amount = result.billAmount;
                        bill.previous_bill_date = result.billDueDate;
                        bill.next_bill_date = result.billDueDate;
                        bill.label = 'ACTIVE';
                        bill.bill_status = 'UNPAID';
                        await billRepository.update(bill);
                    }
                }
            }
        })();
        (async () => {
            for (let bill of bills) {
                if (bill.category !== 'CREDIT_CARD_BILL') continue;
                if (bill.label === 'ACTIVE') {
                    if (isBefore(new Date(), addDays(bill.previous_bill_date, 15))) {
                        bill.label = 'DUE';
                        billRepository.update(bill).then();
                        continue;
                    }
                }
                let syncDate: Date = new Date();
                if (isBefore(syncDate, bill.next_bill_date)) continue;
                connection.search(
                    [
                        ['SINCE', subMonths(bill.next_bill_date, 1)],
                        ['SUBJECT', bill.bill_consumer_no]
                    ],
                    (error, uids) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (uids.length === 0) return;
                        const iFetch = connection.fetch(uids, {
                            bodies: ''
                        });
                        iFetch.on('message', function (msg, sequenceNumber) {
                            msg.once('body', function (stream, info) {
                                simpleParser(stream, async (error, parsedMail) => {
                                    if (error) {
                                        logger.error(error.message);
                                        return;
                                    }
                                    if (!parsedMail.from?.text) return;
                                    let billProcessor = CreditCardBillProcessorFactory.getProcessor(parsedMail.from?.text);
                                    if (billProcessor) {
                                        let updatedBill = billProcessor.process(parsedMail, bill);
                                        if (updatedBill) billRepository.update(bill).then();
                                    }
                                });
                            });
                        });
                        iFetch.on('error', (error) => {
                            logger.error(`Error On Processing Mail ${error.message}`);
                        });
                        iFetch.on('end', () => {
                            logger.info(`Message has been processed`);
                        });
                    }
                );
            }
        })();
    }
}

export const billSyncProvider = new BillsSyncProvider();
