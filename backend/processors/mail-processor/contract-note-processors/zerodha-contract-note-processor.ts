import { ParsedMail } from 'mailparser';
import { DematAccount } from '../../../database/models/demat-account.js';
import { parse } from 'date-fns';
import { Logger } from '../../../core/logger.js';
import { ContractNoteProcessor } from './contract-note-processor.js';

const logger: Logger = new Logger('ZerodhaContractNoteProcessor');

// A regular expression to specifically find a date formatted like "January 01, 2023".
// This is more robust than splitting the string.
const DATE_REGEX = /[A-Z][a-z]+ \d{1,2}, \d{4}/;

/**
 * Processes contract notes from Zerodha.
 *
 * This processor extracts the trade date from the subject of the email.
 * The subject is expected to contain a date in the format "MMMM dd, yyyy".
 */
export class ZerodhaContractNoteProcessor extends ContractNoteProcessor {
    /**
     * Extracts the trade date from the email subject.
     *
     * @param parsedMail The parsed email.
     * @param dematAccount The demat account associated with the email.
     * @returns The trade date, or undefined if the date cannot be extracted.
     */
    processForAccount(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        let subject = parsedMail.subject;
        if (!subject) {
            logger.warn('Email has no subject, cannot extract trade date.');
            return undefined;
        }

        // Use the regular expression to find the date string in the subject.
        const match = subject.match(DATE_REGEX);
        if (!match) {
            logger.warn(`Could not find a valid date pattern in the subject: "${subject}"`);
            return undefined;
        }

        const dateString = match[0];
        const formatString = 'MMMM dd, yyyy';

        try {
            // Safely parse the extracted date string into a Date object.
            return parse(dateString, formatString, new Date());
        } catch (error) {
            logger.error(`Failed to parse the extracted date string: "${dateString}"`, { error });
            return undefined;
        }
    }
}
