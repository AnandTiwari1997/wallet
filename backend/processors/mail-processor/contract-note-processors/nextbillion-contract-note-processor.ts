/**
 * @file nextbillion-contract-note-processor.ts
 * @description This file contains the implementation of the NextBillionContractNoteProcessor class, which is responsible for processing contract notes from NextBillion for a given Demat account.
 */

import { ParsedMail } from 'mailparser';
import { DematAccount } from '../../../database/models/demat-account.js';
import { parse } from 'date-fns';
import { Logger } from '../../../core/logger.js';
import { ContractNoteProcessor } from './contract-note-processor.js';

const logger: Logger = new Logger('NextBillionContractNoteProcessor');

// A single, more specific regular expression to find dates in dd-MM-yyyy or dd/MM/yyyy format.
const DATE_REGEX = /\d{2}[-/]\d{2}[-/]\d{4}/;

/**
 * @class NextBillionContractNoteProcessor
 * @description This class extends the ContractNoteProcessor and is responsible for processing contract notes from NextBillion.
 * It extracts the transaction date from the subject of the email.
 */
export class NextBillionContractNoteProcessor extends ContractNoteProcessor {
    /**
     * @method processForAccount
     * @description This method processes the contract note for a given Demat account.
     * It checks if the email is from the broker associated with the Demat account and then extracts the transaction date from the subject of the email.
     * @param {ParsedMail} parsedMail - The parsed email object.
     * @param {DematAccount} dematAccount - The Demat account for which the contract note is to be processed.
     * @returns {Date | undefined} - The transaction date if it can be extracted from the email subject, otherwise undefined.
     */
    processForAccount(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        let subject = parsedMail.subject;
        if (!subject) {
            logger.warn('Email has no subject, cannot extract trade date.');
            return undefined;
        }

        // Find a date string (e.g., "25-12-2023" or "25/12/2023") in the subject.
        const match = subject.match(DATE_REGEX);
        if (!match) {
            logger.warn(`Could not find a valid date pattern in the subject: "${subject}"`);
            return undefined;
        }

        const dateString = match[0];
        // Determine the correct format for date-fns based on the separator used.
        const formatString = dateString.includes('/') ? 'dd/MM/yyyy' : 'dd-MM-yyyy';

        try {
            // Parse the date string into a Date object.
            return parse(dateString, formatString, new Date());
        } catch (error) {
            logger.error(`Failed to parse the extracted date string: "${dateString}"`, { error });
            return undefined;
        }
    }
}
