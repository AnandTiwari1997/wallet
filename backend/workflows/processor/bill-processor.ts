import { ParsedMail } from 'mailparser';
import { Bill } from '../../database/models/bill.js';
import { AirtelBillProcessor } from './airtel-bill-processor.js';

export interface BillProcessor {
    process: (parsedMail: ParsedMail, bill: Bill) => Bill;
}

export class BillProcessorFactory {
    static getProcessor(billEmail: string) {
        switch (billEmail) {
            case 'ebill@airtel.com':
                return new AirtelBillProcessor();
            default:
                return;
        }
    }
}
