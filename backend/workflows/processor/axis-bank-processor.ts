import { Category, PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../database/models/account-transaction.js';
import { ParsedMail } from 'mailparser';
import { Logger } from '../../core/logger.js';
import { BankProcessor } from './bank-processor.js';
import * as htmlparser2 from 'htmlparser2';
import { Account } from '../../database/models/account.js';

const logger: Logger = new Logger('AxisBankProcessor');

export class AxisBankProcessor implements BankProcessor {
    emailId: string = 'alerts@axisbank.com';
    decimalAmountRegexExpression = new RegExp('(\\d+(\\.\\d+)?)');
    accountNumberRegexExpression = new RegExp('[aA]/c\\sno\\.\\s([A-Z0-9]+)');
    infoRegexExpression = new RegExp('(Info-\\s|Info:\\s|(IST)*\\sat\\s)([^.]*)');
    dateRegexExpression = new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?');

    process(parsedMail: ParsedMail, account: Account): Transaction | undefined {
        if (parsedMail.from?.text.includes(this.emailId)) {
            let mailText: string = this.getMailText(parsedMail);
            let amount: string = '';
            let accountNo: string = '';
            let transactionDateTime: string = '';
            let transactionInfo: string = '';

            let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
            let isCredit: boolean | undefined = mailText.toLowerCase().includes('credited');
            if (!isCredit && !isDebit) return;

            amount = this.getAmount(mailText);
            if (amount.length > 0) {
                mailText = mailText.replace(this.decimalAmountRegexExpression, '');
            }
            accountNo = this.getAccountNumber(mailText);
            if (accountNo.length > 0) {
                mailText = mailText.replace(this.accountNumberRegexExpression, '');
            }
            transactionDateTime = this.getDate(mailText);
            if (transactionDateTime.length > 0) {
                mailText = mailText.replace(this.dateRegexExpression, '');
            }
            transactionInfo = this.getDescription(mailText);
            let note = {
                transactionDate: transactionDateTime,
                transactionAccount: accountNo,
                transactionInfo: transactionInfo,
                transactionAmount: amount
            };

            if (accountNo.includes('XX')) {
                let startIndex = account.account_number.length - 4;
                let actualAccountNumber = 'XX' + account.account_number.substring(startIndex);
                if (actualAccountNumber !== accountNo) return;
            } else {
                let startIndex = account.account_number.length - 6;
                let actualAccountNumber = account.account_number.substring(startIndex);
                if (actualAccountNumber !== accountNo) return;
            }

            let description: string = JSON.stringify(note);
            if (amount.length > 0) {
                return {
                    transaction_id: '',
                    account: account,
                    transaction_date: parsedMail.date || new Date(),
                    amount: Number.parseFloat(amount),
                    category: Category.OTHER,
                    labels: [],
                    note: description,
                    transaction_state: TransactionStatus.COMPLETED,
                    payment_mode: transactionInfo.includes('UPI') ? PaymentMode.MOBILE_TRANSFER : PaymentMode.BANK_TRANSFER,
                    transaction_type: isDebit ? TransactionType.EXPENSE : TransactionType.INCOME,
                    dated: parsedMail.date || new Date(),
                    currency: 'INR'
                };
            }
        }
        return;
    }

    getAmount(mailString: string): string {
        let matchArray = mailString?.match(this.decimalAmountRegexExpression);
        if (matchArray) return matchArray[1];
        return '';
    }

    getAccountNumber(mailString: string): string {
        let matchArray = mailString?.match(this.accountNumberRegexExpression);
        if (matchArray) return matchArray[1];
        return '';
    }

    getDescription(mailString: string): string {
        let matchArray = mailString?.match(this.infoRegexExpression);
        if (matchArray) return matchArray[3];
        return '';
    }

    getDate(mailString: string): string {
        let matchArray = mailString?.match(this.dateRegexExpression);
        let transactionDateTime = '';
        if (matchArray) {
            transactionDateTime = matchArray[0];
            transactionDateTime = transactionDateTime.replace(' at ', ' ');
        }
        return transactionDateTime;
    }

    getMailText(parsedMail: ParsedMail): string {
        let mailText: string;
        if (parsedMail.html) {
            let skipText = false;
            let texts: string[] = [];
            let parser = new htmlparser2.Parser({
                onopentag(name: string, attribs: { [p: string]: string }, isImplied: boolean) {
                    if (name === 'style') skipText = true;
                },
                ontext(text) {
                    if (!skipText && text.trim().length > 0) {
                        if (text.trim().includes('Rs') || text.trim().includes('INR')) {
                            texts.push(text.trim());
                        }
                    }
                },
                onclosetag(name: string, isImplied: boolean) {
                    if (name === 'style') skipText = false;
                }
            });
            parser.write(parsedMail.html);
            parser.end();
            mailText = texts.join(' ');
        } else {
            mailText = parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
        }
        return mailText;
    }
}
