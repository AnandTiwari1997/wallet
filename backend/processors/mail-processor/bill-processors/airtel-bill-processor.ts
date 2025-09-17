/**
 * @file This file contains the implementation of the AirtelBillProcessor class, which is responsible for processing Airtel bills from parsed emails.
 */
import { ParsedMail } from 'mailparser';
import { Bill } from '../../../database/models/bill.js';
import { addMonths } from 'date-fns';
import { IBillProcessor } from '../../processor-factory.js';
import { htmlParserUtil } from '../../../utils/html-parser-util.js';
import { billRepository } from '../../../database/repository/bill-repository.js';

/**
 * @class AirtelBillProcessor
 * @implements {IBillProcessor}
 * This class processes emails to extract details for Airtel bills.
 */
export class AirtelBillProcessor implements IBillProcessor {
    /**
     * Processes a parsed email for a specific bill account.
     * It extracts the bill amount and updates the bill's properties.
     * @param {ParsedMail} parsedMail - The parsed email object.
     * @param {Bill} bill - The bill object to be updated.
     * @returns {Bill} The updated bill object.
     */
    processForAccount(parsedMail: ParsedMail, bill: Bill): Bill {
        let mailText = '';
        if (parsedMail.html) mailText = htmlParserUtil(parsedMail.html, (text: string) => text);
        else mailText = parsedMail.text || '';
        // Regex to find the bill amount (e.g., ₹ 123.45)
        let matchResult = mailText.match(new RegExp('₹ (\\d+(\\.\\d+)?)'));
        if (matchResult) {
            bill.bill_amount = Number.parseFloat(matchResult[1]);
            bill.bill_status = 'UNPAID';
            bill.previous_bill_date = bill.next_bill_date;
            bill.next_bill_date = addMonths(bill.previous_bill_date, 1);
            bill.label = 'ACTIVE';
        }
        return bill;
    }

    /**
     * The main processing method for the Airtel bill processor.
     * It finds all internet bills, and for those that are Airtel bills, it processes the email to update them.
     * @param {ParsedMail} parsedMail - The parsed email object.
     */
    process(parsedMail: ParsedMail): void | any | undefined {
        billRepository
            .find({
                where: {
                    category: 'INTERNET_BILL'
                }
            })
            .then((bills) => {
                for (let bill of bills) {
                    if (bill.vendor_name.toLowerCase().includes('airtel')) {
                        let updatedBill = this.processForAccount(parsedMail, bill);
                        if (updatedBill) billRepository.update(bill.bill_id, bill).then();
                    }
                }
            });
    }
}
