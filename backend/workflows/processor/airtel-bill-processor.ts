import { BillProcessor } from './bill-processor.js';
import { ParsedMail } from 'mailparser';
import { Bill } from '../../database/models/bill.js';
import { htmlParser } from '../html-parser.js';
import { addMonths } from 'date-fns';

export class AirtelBillProcessor implements BillProcessor {
    process(parsedMail: ParsedMail, bill: Bill): Bill {
        let mailText = '';
        if (parsedMail.html) mailText = htmlParser(parsedMail.html, (text: string) => text);
        else mailText = parsedMail.text || '';
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
}
