import { CreditCardBillProcessor } from './processors.js';
import { ParsedMail } from 'mailparser';
import { Bill } from '../../database/models/bill.js';
import { htmlParser } from '../html-parser.js';
import { Logger } from '../../core/logger.js';
import { addMonths } from 'date-fns';

const logger: Logger = new Logger('AxisBankCreditCardBillProcessor');

export class AxisBankCreditCardBillProcessor implements CreditCardBillProcessor {
    process(parsedMail: ParsedMail, bill: Bill): Bill | undefined {
        let mailText = '';
        if (parsedMail.html) {
            let count: number = 0;
            mailText = htmlParser(parsedMail.html, (text: string) => {
                if (text.trim().match(new RegExp('^\\d+(\\.\\d+)?$')) && count <= 2) {
                    count++;
                    return text.trim();
                } else if (text.trim().match(new RegExp('^\\d+/\\d+/\\d+$')) && count <= 2) {
                    count++;
                    return text.trim();
                } else {
                    return '';
                }
            });
        } else mailText = parsedMail.text || '';
        let matchResult: string[] = mailText.trim().split(' ');
        if (matchResult.length === 3) {
            bill.bill_amount = Number.parseFloat(matchResult[0]);
            bill.bill_status = 'UNPAID';
            bill.previous_bill_date = parsedMail.date || new Date();
            bill.next_bill_date = addMonths(bill.previous_bill_date, 1);
            bill.label = 'ACTIVE';
        }
        return bill;
    }
}
