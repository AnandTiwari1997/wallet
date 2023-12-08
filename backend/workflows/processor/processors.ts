import { ParsedMail } from 'mailparser';
import { Transaction } from '../../database/models/account-transaction.js';
import { AxisBankProcessor } from './axis-bank-processor.js';
import { Account } from '../../database/models/account.js';
import { LicHflBankProcessor } from './lic-hfl-bank-processor.js';
import { PnbBankProcessor } from './pnb-bank-processor.js';
import { MPWestZoneElectricityDistributionProcessor } from './mp-paschim-kshetra-vidyut-processor.js';
import { WebDriver } from 'selenium-webdriver';
import { MaharashtraStateElectricityDistributionProcessor } from './maharastra-state-electricity-distribution-processor.js';
import { DematAccount } from '../../database/models/demat-account.js';
import { NextBillionContractNoteProcessor } from './nextbillion-contract-note-processor.js';
import { ZerodhaContractNoteProcessor } from './zerodha-contract-note-processor.js';

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

export interface ElectricityBillProcessor {
    process: (
        billConsumerNumber: string,
        driver: WebDriver
    ) => Promise<
        | {
              billAmount: number;
              billDueDate: Date;
          }
        | undefined
    >;
}

export class ElectricityBillProcessorFactory {
    static getProcessor = (billConsumerName: string): ElectricityBillProcessor | undefined => {
        switch (billConsumerName) {
            case 'MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD':
                return new MaharashtraStateElectricityDistributionProcessor();
            case 'M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD':
                return new MPWestZoneElectricityDistributionProcessor();
            default:
                return;
        }
    };
}

export interface ContractNoteProcessor {
    process: (parsedMail: ParsedMail, dematAccount: DematAccount) => Date | undefined;
}

export class ContractNoteProcessorFactory {
    static getProcessor = (brokerEmail: string): ContractNoteProcessor | undefined => {
        switch (brokerEmail) {
            case 'noreply@groww.in':
                return new NextBillionContractNoteProcessor();
            case 'no-reply-contract-notes@reportsmailer.zerodha.net':
                return new ZerodhaContractNoteProcessor();
            default:
                return;
        }
    };
}
