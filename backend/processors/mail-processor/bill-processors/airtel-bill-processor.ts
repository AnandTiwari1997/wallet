import { ParsedMail } from 'mailparser';
import { Bill } from '../../../database/models/bill.js';
import { addMonths } from 'date-fns';
import { IBillProcessor } from '../../processor-factory.js';
import { htmlParserUtil } from '../../../utils/html-parser-util.js';
import { billRepository } from '../../../database/repository/bill-repository.js';

export class AirtelBillProcessor implements IBillProcessor {
    processMail(parsedMail: ParsedMail, bill: Bill): Bill {
        let mailText = '';
        if (parsedMail.html) mailText = htmlParserUtil(parsedMail.html, (text: string) => text);
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
                        let updatedBill = this.processMail(parsedMail, bill);
                        if (updatedBill) billRepository.update(bill.bill_id, bill).then();
                    }
                }
            });
    }
}
