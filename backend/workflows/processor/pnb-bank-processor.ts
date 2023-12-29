import { BankProcessor } from './processors.js';
import { ParsedMail } from 'mailparser';
import { Account } from '../../database/models/account.js';
import { Category, PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../database/models/account-transaction.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('PnbBankProcessor');

export class PnbBankProcessor implements BankProcessor {
    emailId: string = 'pnbealert@punjabnationalbank.in';
    decimalAmountRegexExpression = new RegExp('Rs.(\\d+(\\.\\d+)?)');
    accountNumberRegexExpression = new RegExp('Ac (\\w+)');
    infoRegexExpression = new RegExp('thru (.*) Aval');
    dateRegexExpression = new RegExp('\\d+-\\d+-\\d+((.*)\\d+:\\d+:\\d+)?');

    getAccountNumber(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.accountNumberRegexExpression);
        if (matchArray) return matchArray[1];
        return '';
    }

    getAmount(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.decimalAmountRegexExpression);
        if (matchArray) return matchArray[1];
        return '';
    }

    getDate(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.dateRegexExpression);
        let transactionDateTime = '';
        if (matchArray) {
            transactionDateTime = matchArray[0];
        }
        return transactionDateTime;
    }

    getDescription(mailString: string, regex: RegExp | undefined): string {
        let matchArray = mailString?.match(regex || this.infoRegexExpression);
        if (matchArray) return matchArray[1];
        return '';
    }

    getMailText(parsedMail: ParsedMail, onText: (text: string) => string | undefined): string {
        return parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
    }

    process(parsedMail: ParsedMail, account: Account): Transaction | undefined {
        if (parsedMail.from?.text.includes(this.emailId)) {
            let mailText: string = this.getMailText(parsedMail, (text: string) => text);
            let amount: string = '';
            let accountNo: string = '';
            let transactionDateTime: string = '';
            let transactionInfo: string = '';

            let isDebit: boolean | undefined = mailText.toLowerCase().includes('debited');
            let isCredit: boolean | undefined = mailText.toLowerCase().includes('credited');
            if (!isCredit && !isDebit) return;

            amount = this.getAmount(mailText, this.decimalAmountRegexExpression);
            accountNo = this.getAccountNumber(mailText, this.accountNumberRegexExpression);
            transactionDateTime = this.getDate(mailText, this.dateRegexExpression);
            transactionInfo = this.getDescription(mailText, this.infoRegexExpression);
            let note = {
                transactionDate: transactionDateTime,
                transactionAccount: accountNo,
                transactionInfo: transactionInfo,
                transactionAmount: amount
            };

            if (accountNo.includes('XX')) {
                let startIndex = account.account_number.length - 8;
                let actualAccountNumber = account.account_number.substring(startIndex);
                if (actualAccountNumber !== accountNo.replace(new RegExp('X+'), '')) return;
            }

            let description: string = JSON.stringify(note);
            transactionInfo = transactionInfo.replace(new RegExp('/(P2A|P2M|P2P)'), '');
            transactionInfo = transactionInfo.replace(new RegExp('/\\d+/'), '/');
            let labels: string[] = transactionInfo.split('/');
            if (labels.length === 1) {
                labels = transactionInfo.split(' ');
            }

            if (amount.length > 0) {
                return {
                    transaction_id: '',
                    account: account,
                    transaction_date: parsedMail.date || new Date(),
                    amount: Number.parseFloat(amount),
                    category: Category.OTHER,
                    labels: labels,
                    note: description,
                    transaction_state: TransactionStatus.COMPLETED,
                    payment_mode: transactionInfo.includes('NEFT') ? PaymentMode.BANK_TRANSFER : 'ATM',
                    transaction_type: isDebit ? TransactionType.EXPENSE : TransactionType.INCOME,
                    dated: parsedMail.date || new Date(),
                    currency: 'INR'
                };
            }
        }
        return undefined;
    }
}
