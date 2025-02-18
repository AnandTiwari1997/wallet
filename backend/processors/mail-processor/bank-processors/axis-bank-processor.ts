import {
    AccountTransaction,
    Category,
    PaymentMode,
    TransactionStatus,
    TransactionType
} from '../../../database/models/account-transaction.js';
import { ParsedMail } from 'mailparser';
import { Logger } from '../../../core/logger.js';
import { Account } from '../../../database/models/account.js';
import { parse, subHours, subMinutes } from 'date-fns';
import { htmlParserUtil } from '../../../utils/html-parser-util.js';
import { BankProcessor } from './bank-processor.js';

const logger: Logger = new Logger('AxisBankProcessor');

export class AxisBankProcessor extends BankProcessor {
    emailId: string = 'alerts@axisbank.com';

    processLoanTransaction(mailText: string, account: Account): AccountTransaction | undefined {
        let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
        if (!isDebit) return;

        let amount: string;
        let transactionDateTime: string;

        amount = this.getAmount(mailText);
        if (amount.length > 0) {
            mailText = mailText.replace(new RegExp('(INR|INR.|INR |INR. )(\\d+(\\.\\d+)?)'), '');
        }
        transactionDateTime = this.getDate(mailText);
        let note = {
            transactionDate: transactionDateTime,
            transactionAccount: account.account_number,
            transactionInfo: `Credited to Loan Account`,
            transactionAmount: amount
        };
        let description: string = JSON.stringify(note);
        logger.info(description);
        let labels: string[] = ['Loan Account', 'EMI Payment'];
        let date: Date = parse(transactionDateTime, 'dd-MM-yyyy HH:mm:ss', new Date());
        date = subHours(date, 5);
        date = subMinutes(date, 30);
        if (amount.length > 0) {
            return {
                transaction_id: '',
                account_id: account.account_id,
                account: account,
                transaction_date: date,
                amount: Number.parseFloat(amount),
                category: Category.EMI,
                labels: labels,
                note: description,
                transaction_state: TransactionStatus.COMPLETED,
                payment_mode: PaymentMode.BANK_TRANSFER,
                transaction_type: TransactionType.INCOME,
                dated: date,
                currency: 'INR'
            };
        }
        return;
    }

    processCreditCardTransaction(mailText: string, account: Account): AccountTransaction | undefined {
        let isDebit: boolean | undefined =
            mailText.toLowerCase().includes('using your card no. xx') ||
            mailText.toLowerCase().includes('using your credit card no. xx');
        let isCredit: boolean | undefined =
            mailText.toLowerCase().includes('debited') && mailText.toLowerCase().includes('creditcard payment');
        if (!isCredit && !isDebit) return;

        let amount: string = '';
        let transactionDateTime: string = '';
        let transactionInfo: string = '';

        amount = this.getAmount(mailText);
        if (amount.length > 0) {
            mailText = mailText.replace(new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'), '');
        }
        transactionDateTime = this.getDate(mailText);
        if (transactionDateTime.length > 0) {
            mailText = mailText.replace(new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?'), '');
        }
        transactionInfo = this.getDescription(mailText);
        let note = {
            transactionDate: transactionDateTime,
            transactionAccount: account.account_number,
            transactionInfo: `${isDebit ? transactionInfo : 'Credited to Credit Card'} `,
            transactionAmount: amount
        };

        let description: string = JSON.stringify(note);
        let labels: string[] = isDebit ? ['Credit Card', 'Spend', transactionInfo] : ['Credit Card', 'Payment'];
        let date: Date = parse(transactionDateTime, 'dd-MM-yyyy HH:mm:ss', new Date());
        date = subHours(date, 5);
        date = subMinutes(date, 30);
        if (amount.length > 0) {
            return {
                transaction_id: '',
                account_id: account.account_id,
                account: account,
                transaction_date: date,
                amount: Number.parseFloat(amount),
                category: isDebit ? Category.CREDIT_CARD_SPEND : Category.CREDIT_CARD_PAYMENT,
                labels: labels,
                note: description,
                transaction_state: TransactionStatus.COMPLETED,
                payment_mode: PaymentMode.BANK_TRANSFER,
                transaction_type: isDebit ? TransactionType.EXPENSE : TransactionType.INCOME,
                dated: date,
                currency: 'INR'
            };
        }
        return;
    }

    processRegularTransaction(mailText: string, account: Account) {
        let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
        let isCredit: boolean | undefined = mailText.toLowerCase().includes('credited');
        if (!isCredit && !isDebit) return;

        let amount: string = '';
        let accountNo: string = '';
        let transactionDateTime: string = '';
        let transactionInfo: string = '';
        amount = this.getAmount(mailText);
        if (amount.length > 0) {
            mailText = mailText.replace(new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'), '');
        }
        accountNo = this.getAccountNumber(mailText);
        if (accountNo.length > 0) {
            mailText = mailText.replace(new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)'), '');
        }
        transactionDateTime = this.getDate(mailText);
        if (transactionDateTime.length > 0) {
            mailText = mailText.replace(new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?'), '');
        }
        transactionInfo = this.getDescription(mailText);
        let note = {
            transactionDate: transactionDateTime,
            transactionAccount: accountNo,
            transactionInfo: transactionInfo,
            transactionAmount: amount
        };

        let description: string = JSON.stringify(note);
        transactionInfo = transactionInfo.replace(new RegExp('/(P2A|P2M|P2P)'), '');
        transactionInfo = transactionInfo.replace(new RegExp('/\\d+/'), '/');
        let labels: string[] = transactionInfo.split('/');

        let groups = accountNo.match(new RegExp('\\d+'));
        if (!groups) return;
        let startIndex = account.account_number.length - groups[0].length;
        let actualAccountNumber = account.account_number.substring(startIndex);
        if (actualAccountNumber !== groups[0]) return;

        let date: Date = parse(transactionDateTime, 'dd-MM-yy HH:mm:ss', new Date());
        if (isNaN(date.getTime())) {
            date = parse(transactionDateTime, 'dd-MM-yyyy HH:mm:ss', new Date());
        }
        date = subHours(date, 5);
        date = subMinutes(date, 30);
        if (amount.length > 0) {
            return {
                transaction_id: '',
                account_id: account.account_id,
                account: account,
                transaction_date: date,
                amount: Number.parseFloat(amount),
                category: Category.OTHER,
                labels: labels,
                note: description,
                transaction_state: TransactionStatus.COMPLETED,
                payment_mode: transactionInfo.includes('UPI') ? PaymentMode.MOBILE_TRANSFER : PaymentMode.BANK_TRANSFER,
                transaction_type: isDebit ? TransactionType.EXPENSE : TransactionType.INCOME,
                dated: date,
                currency: 'INR'
            };
        }
    }

    processMail(parsedMail: ParsedMail, account: Account): AccountTransaction | undefined {
        if (parsedMail.from?.text.includes(this.emailId)) {
            let mailText: string = this.getMailText(parsedMail);

            if (account.account_type === 'LOAN') {
                return this.processLoanTransaction(mailText, account);
            }
            if (account.account_type === 'CREDIT_CARD') {
                return this.processCreditCardTransaction(mailText, account);
            }
            return this.processRegularTransaction(mailText, account);
        }
        return;
    }

    getAmount(mailString: string): string {
        let matchArray = mailString?.match(new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'));
        if (matchArray) return matchArray[2];
        return '';
    }

    getAccountNumber(mailString: string): string {
        let matchArray = mailString?.match(new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)'));
        if (matchArray) return matchArray[1];
        return '';
    }

    getDescription(mailString: string): string {
        let matchArray = mailString?.match(
            new RegExp('(by\\s(.+))|(Info-\\s(.+))|(Info:\\s(.+))|(\\sat\\s(.+)on)|(IST\\s.*at\\s(.+))')
        );
        let result = '';
        if (matchArray) {
            for (let i = 1; i < matchArray.length; i++) {
                if (matchArray[i]) {
                    result = matchArray[i].trim();
                }
            }
        }
        return result;
    }

    removeAnomalies(mailString: string) {
        if (mailString.includes('IST')) {
            mailString = mailString.replace('IST', '');
        }
        if (mailString.includes('by')) {
            mailString = mailString.replace('by', '');
        }
        if (mailString.includes('at')) {
            mailString = mailString.replace('at', '');
        }
        if (mailString.includes('INR')) {
            mailString = mailString.replace('INR', '');
        }
        if (mailString.includes('Info-')) {
            mailString = mailString.replace('Info-', '');
        }
        return mailString;
    }

    getDate(mailString: string): string {
        let matchArray = mailString?.match(new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?'));
        let transactionDateTime = '';
        if (matchArray) {
            transactionDateTime = matchArray[0];
            transactionDateTime = transactionDateTime.replace(/at/, '').replace(/\s+/, ' ');
        }
        return transactionDateTime;
    }

    getMailText(parsedMail: ParsedMail): string {
        let mailText: string = '';
        if (parsedMail.html) {
            mailText = htmlParserUtil(parsedMail.html, (text: string) => {
                if (text.trim().includes('Rs') || text.trim().includes('INR')) {
                    return text.trim();
                } else if (text.trim().includes('credited') || text.trim().includes('debited')) {
                    return text.trim();
                } else if (text.trim().includes('Info')) {
                    return text.trim();
                }
                return;
            });
        } else {
            mailText = parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
        }
        return mailText;
    }
}
