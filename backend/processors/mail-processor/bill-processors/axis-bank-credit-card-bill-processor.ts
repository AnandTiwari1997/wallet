import { ParsedMail } from 'mailparser';
import { Bill } from '../../../database/models/bill.js';
import { Logger } from '../../../core/logger.js';
import { addMonths } from 'date-fns';
import { IBillProcessor } from '../../processor-factory.js';
import { billRepository } from '../../../database/repository/bill-repository.js';
import { htmlParserUtil } from '../../../utils/html-parser-util.js';

const logger: Logger = new Logger('AxisBankCreditCardBillProcessor');

export class AxisBankCreditCardBillProcessor implements IBillProcessor {
    processMail(parsedMail: ParsedMail, bill: Bill): Bill | undefined {
        let mailText = '';
        if (parsedMail.html) {
            let count: number = 0;
            mailText = htmlParserUtil(parsedMail.html, (text: string) => {
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

    process(parsedMail: ParsedMail): any {
        billRepository
            .find({
                where: {
                    category: 'CREDIT_CARD_BILL'
                }
            })
            .then((bills: Bill[]) => {
                for (let bill of bills) {
                    if (!parsedMail.subject?.includes(bill.bill_consumer_no)) continue;
                    let updatedBill = this.processMail(parsedMail, bill);
                    if (updatedBill) billRepository.update(bill.bill_id, bill).then();
                }
            });
    }
}
