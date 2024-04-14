import { ParsedMail } from 'mailparser';
import { Account } from '../database/models/account.js';
import { AccountTransaction } from '../database/models/account-transaction.js';
import { DematAccount } from '../database/models/demat-account.js';
import { Bill } from '../database/models/bill.js';
import { WebDriver } from 'selenium-webdriver';
import { MaharashtraStateElectricityDistributionBillProcessor } from './bill-processor/maharastra-state-electricity-distribution-bill-processor.js';
import { MPWestZoneElectricityDistributionBillProcessor } from './bill-processor/mp-paschim-kshetra-vidyut-bill-processor.js';
import {
    airtelBillProcessor,
    axisBankCreditCardBillProcessor,
    axisBankProcessor,
    licHflBankProcessor,
    mutualFundProcessor,
    nextBillionContractNoteProcessor,
    pnbBankProcessor,
    sbiBankProcessor,
    zerodhaContractNoteProcessor
} from '../singleton.js';

export class ProcessorFactory {
    static getProcessor = (emailId: string, subject: string | undefined): IProcessor<any, any> | undefined => {
        switch (emailId) {
            case 'alerts@axisbank.com':
                return axisBankProcessor;
            case 'pnbealert@punjabnationalbank.in':
                return pnbBankProcessor;
            case 'alerts@sbibank.com':
                return sbiBankProcessor;
            case 'alerts@lichousing.com':
                return licHflBankProcessor;
            case 'noreply@groww.in':
                return nextBillionContractNoteProcessor;
            case 'no-reply-contract-notes@reportsmailer.zerodha.net':
                return zerodhaContractNoteProcessor;
            case 'cc.statements@axisbank.com':
                return axisBankCreditCardBillProcessor;
            case 'ebill@airtel.com':
                return airtelBillProcessor;
            case 'donotreply@camsonline.com':
                if (subject !== 'Consolidated Account Statement - CAMS Mailback Request') {
                    return;
                }
                return mutualFundProcessor;
            default:
                return;
        }
    };
}

export interface IBankProcessor extends IProcessor<Account, AccountTransaction> {
    process: (parsedMail: ParsedMail) => void | any | undefined;
    processMail: (parsedMail: ParsedMail, account: Account) => AccountTransaction | undefined;
}

export interface IContractNoteProcessor extends IProcessor<DematAccount, Date> {
    process: (parsedMail: ParsedMail) => void | any | undefined;
    processMail: (parsedMail: ParsedMail, dematAccount: DematAccount) => Date | undefined;
}

export interface IBillProcessor extends IProcessor<Bill, Bill> {
    process: (parsedMail: ParsedMail) => void | any;
    processMail: (parsedMail: ParsedMail, bill: Bill) => Bill | undefined;
}

export interface IAnonymousProcessor extends IProcessor<any, any> {
    process: (parsedMail: ParsedMail) => void | any | undefined;
    processMail: (parsedMail: ParsedMail, anyParam: any) => any | undefined;
}

export interface IProcessor<T, U> {
    process: (parsedMail: ParsedMail) => void | any | undefined;
    processMail: (parsedMail: ParsedMail, account: T) => U | undefined;
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
                return new MaharashtraStateElectricityDistributionBillProcessor();
            case 'M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD':
                return new MPWestZoneElectricityDistributionBillProcessor();
            default:
                return;
        }
    };
}
