import { ParsedMail } from 'mailparser';
import { Transaction } from '../../database/models/account-transaction.js';
import { AxisBankProcessor } from './axis-bank-processor.js';

export interface BankProcessor {
    process: (parsedMail: ParsedMail) => Transaction | undefined;
}

export class BankProcessorFactory {
    static getProcessor = (bankAlertMailId: string): BankProcessor | undefined => {
        switch (bankAlertMailId) {
            case 'alerts@axisbank.com':
                return new AxisBankProcessor();
            default:
                return;
        }
    };
}
