import { Category, PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../database/models/account-transaction.js';
import { ParsedMail } from 'mailparser';
import { Logger } from '../../core/logger.js';
import { BankProcessor } from './bank-processor.js';
import { convert, HtmlToTextOptions } from 'html-to-text';

const logger: Logger = new Logger('AxisBankProcessor');

const options: HtmlToTextOptions = {
    wordwrap: 130,
    baseElements: {
        selectors: ['body']
    }
};

export class AxisBankProcessor implements BankProcessor {
    amountRegex: string[] = ['Rs. (\\d+)', 'INR\\s(\\d+)', 'Rs. (\\d+\\.\\d+)', 'INR\\s(\\d+\\.\\d+)'];
    accountNumberRegex = ['A/c\\sno\\.\\s([A-Z0-9]+)'];
    emailId: string = 'alerts@axisbank.com';

    process(parsedMail: ParsedMail): Transaction | undefined {
        if (parsedMail.from?.text.includes(this.emailId)) {
            let mailText: string;
            if (parsedMail.html) {
                mailText = convert(parsedMail.html, options);
                mailText = mailText.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ');
            } else {
                mailText = parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
            }
            let amount = '';
            let accountNo = '';
            for (const amountR of this.amountRegex) {
                const re = new RegExp(amountR);
                let groups = mailText?.match(re);
                if (groups) {
                    amount = groups[1];
                    break;
                }
            }
            for (const accountNumber of this.accountNumberRegex) {
                const re = new RegExp(accountNumber);
                let groups = mailText?.match(re);
                if (groups) {
                    accountNo = groups[1];
                    break;
                }
            }
            let description: string | undefined = mailText;
            let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
            if (amount.length > 0) {
                let transaction = new Transaction('', 0, parsedMail.date || new Date(), Number.parseFloat(amount), Category.OTHER, isDebit ? TransactionType.EXPENSE : TransactionType.INCOME);
                transaction.transaction_state = TransactionStatus.COMPLETED;
                transaction.payment_mode = parsedMail.text?.includes('UPI') ? PaymentMode.MOBILE_TRANSFER : PaymentMode.BANK_TRANSFER;
                transaction.note = description;
                return transaction;
            }
        }
        return;
    }
}
