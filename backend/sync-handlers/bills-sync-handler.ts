import { addDays, addMonths, differenceInDays, isAfter, isBefore, isSameDay, subMonths } from 'date-fns';
import { Logger } from '../core/logger.js';
import { Bill } from '../database/models/bill.js';
import { billRepository } from '../database/repository/bill-repository.js';
import { ISyncHandler } from './sync-handler.js';
import { connection } from '../processors/mail-service.js';
import { simpleParser } from 'mailparser';
import { ElectricityBillProcessorFactory, ProcessorFactory } from '../processors/processor-factory.js';
import { electricityVendorMap } from '../config.js';
import { getFirefoxWebDriver } from '../utils/web-driver-util.js';
import { WebDriver } from 'selenium-webdriver';

const logger = new Logger('BillsSyncHandler');

export class BillsSyncHandler implements ISyncHandler<Bill> {
    funcDict: { [key: string]: (bill: Bill) => void } = {
        INTERNET_BILL: this.internetBillSync,
        MONTHLY_INSTALLMENT_BILL: this.monthlyBillSync,
        ELECTRICITY_BILL: this.electricityBillSync,
        MUTUAL_FUND_BILL: this.monthlyBillSync,
        CREDIT_CARD_BILL: this.creditCardBillSync,
        RENT: this.monthlyBillSync
    };

    monthlyBillSync(bill: Bill) {
        if (bill.auto_sync) return;
        let currentDate = new Date();
        let nextBillDate = bill.next_bill_date;
        let diffDays = differenceInDays(nextBillDate, currentDate) < 7;
        if (isBefore(currentDate, nextBillDate) && diffDays) {
            bill.label = 'ACTIVE';
            bill.bill_status = 'UNPAID';
            billRepository.update(bill.bill_id, bill).then((r) => {});
            return;
        }
        if (isSameDay(currentDate, nextBillDate)) {
            bill.previous_bill_date = nextBillDate;
            bill.next_bill_date = addMonths(nextBillDate, 1);
            billRepository.update(bill.bill_id, bill).then((r) => {});
            return;
        }
        let status = bill.bill_status;
        if (status === 'UNPAID' && isAfter(currentDate, bill.previous_bill_date)) {
            bill.label = 'DUE';
            billRepository.update(bill.bill_id, bill).then((r) => {});
            return;
        }
    }

    electricityBillSync(bill: Bill) {
        if (bill.category !== 'ELECTRICITY_BILL') return;
        if (bill.label === 'ACTIVE') return;
        let billProcessor = ElectricityBillProcessorFactory.getProcessor(electricityVendorMap[bill.vendor_name]);
        if (!billProcessor) return;
        getFirefoxWebDriver('', true).then(async (driver: WebDriver) => {
            if (!driver) return;
            if (!billProcessor) return;
            let result = await billProcessor.process(bill.bill_consumer_no, driver);
            if (result) {
                if (isAfter(result.billDueDate, bill.previous_bill_date)) {
                    bill.bill_amount = result.billAmount;
                    bill.previous_bill_date = result.billDueDate;
                    bill.next_bill_date = result.billDueDate;
                    bill.label = 'ACTIVE';
                    bill.bill_status = 'UNPAID';
                    await billRepository.update(bill.bill_id, bill);
                }
            }
        });
    }

    internetBillSync(bill: Bill) {
        if (bill.category !== 'INTERNET_BILL') return;
        if (bill.label === 'ACTIVE') {
            if (isBefore(new Date(), addDays(bill.previous_bill_date, 10))) {
                bill.label = 'DUE';
                billRepository.update(bill.bill_id, bill).then();
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
            (error, mailIds) => {
                if (error) {
                    logger.error(error.message);
                    return;
                }
                if (mailIds.length === 0) return;
                const iFetch = connection.fetch(mailIds, {
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
                            let billProcessor = ProcessorFactory.getProcessor(parsedMail.from?.text, undefined);
                            if (billProcessor) {
                                let updatedBill = billProcessor.processMail(parsedMail, bill);
                                if (updatedBill) billRepository.update(bill.bill_id, bill).then();
                            }
                        });
                    });
                });
                iFetch.on('error', (error) => {
                    logger.error(`Error On Processing Mail ${error.message}`);
                });
                iFetch.on('end', () => {
                    logger.info(`All Mails have been read for Bill ${bill.bill_consumer_no}`);
                });
            }
        );
    }

    creditCardBillSync(bill: Bill) {
        if (bill.category !== 'CREDIT_CARD_BILL') return;
        if (bill.label === 'ACTIVE') {
            if (isBefore(new Date(), addDays(bill.previous_bill_date, 15))) {
                bill.label = 'DUE';
                billRepository.update(bill.bill_id, bill).then();
                return;
            }
        }
        let syncDate: Date = new Date();
        if (isBefore(syncDate, bill.next_bill_date)) return;
        connection.search(
            [
                ['SINCE', subMonths(bill.next_bill_date, 1)],
                ['SUBJECT', bill.bill_consumer_no]
            ],
            (error, mailIds) => {
                if (error) {
                    logger.error(error.message);
                    return;
                }
                if (mailIds.length === 0) return;
                const iFetch = connection.fetch(mailIds, {
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
                            let billProcessor = ProcessorFactory.getProcessor(parsedMail.from?.text, undefined);
                            if (billProcessor) {
                                let updatedBill = billProcessor.processMail(parsedMail, bill);
                                if (updatedBill) billRepository.update(bill.bill_id, bill).then();
                            }
                        });
                    });
                });
                iFetch.on('error', (error) => {
                    logger.error(`Error On Processing Mail ${error.message}`);
                });
                iFetch.on('end', () => {
                    logger.info(`All Mails have been read for Bill ${bill.bill_consumer_no}`);
                });
            }
        );
    }

    sync(bills: Bill[], deltaSync: boolean) {
        bills.forEach((bill) => {
            this.funcDict[bill.category](bill);
        });
    }

    private commonBillFetcher(bill: Bill, criteria: ((string | Date)[] | string[])[]) {}
}
