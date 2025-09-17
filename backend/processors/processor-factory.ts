/**
 * This file contains the factory classes for creating different types of processors.
 * Processors are responsible for handling and extracting data from various sources,
 * such as emails and bills.
 */
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

/**
 * Factory class for creating email processors.
 */
export class ProcessorFactory {
    /**
     * Returns the appropriate processor based on the email sender's ID and subject.
     * @param emailId The email address of the sender.
     * @param subject The subject of the email.
     * @returns An instance of IProcessor or undefined if no suitable processor is found.
     */
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

/**
 * Interface for bank transaction processors.
 */
export interface IBankProcessor extends IProcessor<Account, AccountTransaction> {}

/**
 * Interface for contract note processors.
 */
export interface IContractNoteProcessor extends IProcessor<DematAccount, Date> {}

/**
 * Interface for bill processors.
 */
export interface IBillProcessor extends IProcessor<Bill, Bill> {}

/**
 * Interface for anonymous processors.
 */
export interface IAnonymousProcessor extends IProcessor<any, any> {}

/**
 * Generic processor interface.
 * @template T The account type.
 * @template U The processed data type.
 */
export interface IProcessor<T, U> {
    /**
     * Processes a parsed email.
     * @param parsedMail The parsed email object.
     */
    process: (parsedMail: ParsedMail) => void | any | undefined;

    /**
     * Processes a parsed email for a specific account.
     * @param parsedMail The parsed email object.
     * @param account The account to process the email for.
     * @returns The processed data or undefined.
     */
    processForAccount: (parsedMail: ParsedMail, account: T) => U | undefined;
}

/**
 * Interface for electricity bill processors.
 */
export interface ElectricityBillProcessor {
    /**
     * Processes an electricity bill.
     * @param billConsumerNumber The consumer number for the bill.
     * @param driver The WebDriver instance for browser automation.
     * @returns A promise that resolves with the bill amount and due date, or undefined.
     */
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

/**
 * Factory class for creating electricity bill processors.
 */
export class ElectricityBillProcessorFactory {
    /**
     * Returns the appropriate electricity bill processor based on the consumer name.
     * @param billConsumerName The name of the electricity distribution company.
     * @returns An instance of ElectricityBillProcessor or undefined if no suitable processor is found.
     */
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
