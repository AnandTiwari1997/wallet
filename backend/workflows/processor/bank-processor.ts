import { ParsedMail } from 'mailparser';
import { Transaction } from '../../database/models/account-transaction.js';
import { AxisBankProcessor } from './axis-bank-processor.js';
import { Account } from '../../database/models/account.js';
import { LicHflBankProcessor } from './lic-hfl-bank-processor.js';
import { PnbBankProcessor } from './pnb-bank-processor.js';

export interface BankProcessor {
    process: (parsedMail: ParsedMail, account: Account) => Transaction | undefined;
    getAmount: (mailString: string, regex: RegExp | undefined) => string;
    getAccountNumber: (mailString: string, regex: RegExp | undefined) => string;
    getDescription: (mailString: string, regex: RegExp | undefined) => string;
    getDate: (mailString: string, regex: RegExp | undefined) => string;
    getMailText: (parsedMail: ParsedMail, onText: (text: string) => string | undefined) => string;
}

export class BankProcessorFactory {
    static getProcessor = (bankAlertMailId: string): BankProcessor | undefined => {
        switch (bankAlertMailId) {
            case 'alerts@axisbank.com':
                return new AxisBankProcessor();
            case 'alerts@lichousing.com':
                return new LicHflBankProcessor();
            case 'pnbealert@punjabnationalbank.in':
                return new PnbBankProcessor();
            default:
                return;
        }
    };
}
