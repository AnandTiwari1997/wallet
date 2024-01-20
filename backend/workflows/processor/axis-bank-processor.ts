import { Category, PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../database/models/account-transaction.js';
import { ParsedMail } from 'mailparser';
import { Logger } from '../../core/logger.js';
import { BankProcessor } from './processors.js';
import { Account } from '../../database/models/account.js';
import { htmlParser } from '../html-parser.js';
import { parse, subHours, subMinutes } from 'date-fns';

const logger: Logger = new Logger('AxisBankProcessor');

export class AxisBankProcessor implements BankProcessor {
    emailId: string = 'alerts@axisbank.com';
    regexMap: { [key: string]: { amount: RegExp; account: RegExp; date: RegExp; description: RegExp } } = {
        BANK: {
            account: new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)'),
            amount: new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'),
            description: new RegExp('(Info-|Info-\\s|Info:\\s|(IST)*\\sat\\s([^.]*)|(IST)*\\sby\\s)([^.]*)'),
            date: new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?')
        },
        LOAN: {
            account: new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)'),
            amount: new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'),
            description: new RegExp('(Info-|Info-\\s|Info:\\s|(IST)*\\sat\\s([^.]*)|(IST)*\\sby\\s)([^.]*)'),
            date: new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?')
        },
        CREDIT_CARD: {
            account: new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)'),
            amount: new RegExp('(INR|INR.|INR |INR. |Rs|Rs.|Rs |Rs. )(\\d+(\\.\\d+)?)'),
            description: new RegExp('(Info-|Info-\\s|Info:\\s|(IST)*\\sat\\s([^.]*)|(IST)*\\sby\\s)([^.]*)'),
            date: new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?')
        }
    };
    infoMap: { [key: string]: string } = {
        LOAN: 'Credited to Loan Account',
        CREDIT_CARD: 'Credited to Credit Card'
    };
    debitMap: { [key: string]: { true: string; false: string } } = {
        BANK: { true: TransactionType.EXPENSE, false: TransactionType.INCOME },
        CREDIT_CARD: { true: TransactionType.INCOME, false: TransactionType.EXPENSE }
    };

    process(parsedMail: ParsedMail, account: Account): Transaction | undefined {
        if (parsedMail.from?.text.includes(this.emailId)) {
            let mailText: string = this.getMailText(parsedMail, (text: string) => {
                if (text.trim().includes('Rs') || text.trim().includes('INR')) {
                    return text.trim();
                } else if (text.trim().includes('credited') || text.trim().includes('debited')) {
                    return text.trim();
                } else if (text.trim().includes('Info')) {
                    return text.trim();
                }
                return;
            });

            let amount: string = '';
            let accountNo: string = '';
            let transactionDateTime: string = '';
            let transactionInfo: string = '';
            let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
            let isCredit: boolean | undefined = mailText.toLowerCase().includes('credited') || mailText.toLowerCase().includes('using your card no.');
            if (!isCredit && !isDebit) return;

            amount = this.getAmount(mailText, this.regexMap[account.account_type]['amount']);
            if (amount.length > 0) {
                mailText = mailText.replace(this.regexMap[account.account_type]['amount'], '');
            }
            accountNo = this.getAccountNumber(mailText, this.regexMap[account.account_type]['account']);
            if (accountNo.length > 0) {
                mailText = mailText.replace(this.regexMap[account.account_type]['account'], '');
            }
            transactionDateTime = this.getDate(mailText, this.regexMap[account.account_type]['date']);
            if (transactionDateTime.length > 0) {
                mailText = mailText.replace(this.regexMap[account.account_type]['date'], '');
            }
            transactionInfo = this.getDescription(mailText, this.regexMap[account.account_type]['description']);
            let note = {
                transactionDate: transactionDateTime,
                transactionAccount: account.account_type === 'BANK' ? accountNo : account.account_number,
                transactionInfo: account.account_type === 'BANK' ? transactionInfo : this.infoMap[account.account_type],
                transactionAmount: amount
            };
            let description: string = JSON.stringify(note);
            transactionInfo = transactionInfo.replace(new RegExp('/(P2A|P2M|P2P)'), '');
            transactionInfo = transactionInfo.replace(new RegExp('/\\d+/'), '/');
            let labels: string[] = transactionInfo.split('/');
            if (labels.length === 1) {
                labels = account.account_type === 'LOAN' ? ['Axis Bank', 'Loan Account', 'EMI'] : labels;
                labels = account.account_type === 'CREDIT_CARD' ? ['Credit Card', 'Payment'] : labels;
            }

            if (account.account_type === 'BANK') {
                let groups = accountNo.match(new RegExp('\\d+'));
                if (!groups) return;
                let startIndex = account.account_number.length - groups[0].length;
                let actualAccountNumber = account.account_number.substring(startIndex);
                if (actualAccountNumber !== groups[0]) return;
            }
            let date: Date = parse(transactionDateTime, 'dd-MM-yy HH:mm:ss', new Date());
            if (isNaN(date.getTime())) {
                date = parse(transactionDateTime, 'dd-MM-yyyy HH:mm:ss', new Date());
            }
            date = subHours(date, 5);
            date = subMinutes(date, 30);
            if (amount.length > 0) {
                return {
                    transaction_id: '',
                    account: account,
                    transaction_date: date,
                    amount: Number.parseFloat(amount),
                    category: Category.OTHER,
                    labels: labels,
                    note: description,
                    transaction_state: TransactionStatus.COMPLETED,
                    payment_mode: account.account_type === 'BANK' ? (transactionInfo.includes('UPI') ? PaymentMode.MOBILE_TRANSFER : PaymentMode.BANK_TRANSFER) : PaymentMode.BANK_TRANSFER,
                    transaction_type: account.account_type === 'LOAN' ? TransactionType.INCOME : this.debitMap[account.account_type][`${isDebit}`],
                    dated: date,
                    currency: 'INR'
                };
            }
        }
        return;
    }

    getAmount(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.regexMap['BANK']['amount']);
        if (matchArray) return matchArray[2];
        return '';
    }

    getAccountNumber(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.regexMap['BANK']['account']);
        if (matchArray) return matchArray[1];
        return '';
    }

    getDescription(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.regexMap['BANK']['description']);
        if (matchArray) {
            if (matchArray[3]) return matchArray[3];
            else if (matchArray[5]) return matchArray[5];
        }
        return '';
    }

    getDate(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.regexMap['BANK']['date']);
        let transactionDateTime = '';
        if (matchArray) {
            transactionDateTime = matchArray[0];
            transactionDateTime = transactionDateTime.replace(/at/, '').replace(/\s+/, ' ');
        }
        return transactionDateTime;
    }

    getMailText(parsedMail: ParsedMail, onText: (text: string) => string | undefined): string {
        let mailText: string = '';
        if (parsedMail.html) {
            mailText = htmlParser(parsedMail.html, onText);
        } else {
            mailText = parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
        }
        return mailText;
    }
}
