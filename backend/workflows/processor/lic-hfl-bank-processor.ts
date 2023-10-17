import { BankProcessor, BankProcessorFactory } from './bank-processor.js';
import { ParsedMail } from 'mailparser';
import { Account } from '../../database/models/account.js';
import { PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../database/models/account-transaction.js';
import * as htmlparser2 from 'htmlparser2';

const ALERTS_EMAIL_MAP: { [key: string]: string } = {
    'alerts@axisbank.com': 'LICHousingFinanceLtd'
};

export class LicHflBankProcessor implements BankProcessor {
    process(parsedMail: ParsedMail, account: Account): Transaction | undefined {
        let emailId = parsedMail.from?.value[0].address;
        if (emailId) {
            let mailText = this.getMailText(parsedMail);
            let name = ALERTS_EMAIL_MAP[emailId];
            if (mailText.includes(name) && mailText.includes(account.account_number)) {
                let bankProcessor = BankProcessorFactory.getProcessor(emailId);
                let bankMailText = bankProcessor?.getMailText(parsedMail);
                let note: { [key: string]: string } = {
                    transactionDate: bankProcessor?.getDate(bankMailText || '') || '',
                    transactionAccount: account.account_number,
                    transactionInfo: 'Credited to Loan Account',
                    transactionAmount: bankProcessor?.getAmount(bankMailText || '') || ''
                };
                if (note.transactionAmount.length > 0) {
                    return {
                        transaction_id: '',
                        account: account,
                        transaction_date: parsedMail.date || new Date(),
                        amount: Number.parseFloat(note.transactionAmount),
                        category: 'EMI',
                        labels: [],
                        note: JSON.stringify(note),
                        transaction_state: TransactionStatus.COMPLETED,
                        payment_mode: PaymentMode.BANK_TRANSFER,
                        transaction_type: TransactionType.INCOME,
                        dated: parsedMail.date || new Date(),
                        currency: 'INR'
                    };
                }
            }
        }
        return undefined;
    }

    getAccountNumber(mailString: string): string {
        return '';
    }

    getAmount(mailString: string): string {
        return '';
    }

    getDate(mailString: string): string {
        return '';
    }

    getDescription(mailString: string): string {
        return '';
    }

    getMailText(parsedMail: ParsedMail): string {
        let mailText = '';
        if (parsedMail.html) {
            let skipText = false;
            let texts: string[] = [];
            let parser = new htmlparser2.Parser({
                onopentag(name: string, attribs: { [p: string]: string }, isImplied: boolean) {
                    if (name === 'style') skipText = true;
                },
                ontext(text) {
                    if (!skipText && text.trim().length > 0) texts.push(text.trim());
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
