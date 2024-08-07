import { ParsedMail } from 'mailparser';
import { Account } from '../../../database/models/account.js';
import {
    AccountTransaction,
    Category,
    PaymentMode,
    TransactionStatus,
    TransactionType
} from '../../../database/models/account-transaction.js';

import { Logger } from '../../../core/logger.js';
import { BankProcessor } from './bank-processor.js';
import { htmlParserUtil } from '../../../utils/html-parser-util.js';
import { ProcessorFactory } from '../../processor-factory.js';

const logger = new Logger('SbiBankProcessor');

const ALERTS_EMAIL_MAP: { [key: string]: string } = {
    'alerts@axisbank.com': 'ACH-DR-RACPC II INDORE-NCA'
};

export class SbiBankProcessor extends BankProcessor {
    getAccountNumber(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getAmount(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getDate(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getDescription(mailString: string, regex: RegExp | undefined): string {
        return '';
    }

    getMailText(parsedMail: ParsedMail, onText: (text: string) => string | undefined): string {
        let mailText = '';
        if (parsedMail.html) {
            mailText = htmlParserUtil(parsedMail.html, onText);
        } else {
            mailText = parsedMail.text?.replace(/(\r\n|\n|\r)/gm, '').replace(/\s/gm, ' ') || '';
        }
        return mailText;
    }

    processMail(parsedMail: ParsedMail, account: Account): AccountTransaction | undefined {
        let emailId = parsedMail.from?.value[0].address;
        if (emailId) {
            let mailText = this.getMailText(parsedMail, (text: string) => text);
            let name = ALERTS_EMAIL_MAP[emailId];
            if (mailText.includes(name) && mailText.includes(account.account_number)) {
                let bankProcessor = ProcessorFactory.getProcessor(emailId, undefined) as BankProcessor;
                let bankMailText = bankProcessor?.getMailText(parsedMail, (text: string) => {
                    if (text.trim().includes('Rs') || text.trim().includes('INR')) {
                        return text.trim();
                    } else if (text.trim().includes('credited') || text.trim().includes('debited')) {
                        return text.trim();
                    } else if (text.trim().includes('Info')) {
                        return text.trim();
                    }
                    return;
                });
                let note: { [key: string]: string } = {
                    transactionDate: bankProcessor?.getDate(bankMailText || '', undefined) || '',
                    transactionAccount: account.account_number,
                    transactionInfo: 'Credited to Loan Account',
                    transactionAmount: bankProcessor?.getAmount(bankMailText || '', undefined) || ''
                };
                if (note.transactionAmount.length > 0) {
                    return {
                        transaction_id: '',
                        account_id: account.account_id,
                        account: account,
                        transaction_date: parsedMail.date || new Date(),
                        amount: Number.parseFloat(note.transactionAmount),
                        category: Category.EMI,
                        labels: ['SBI', 'EMI', 'Loan Account'],
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
}
