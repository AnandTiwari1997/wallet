import { ParsedMail } from 'mailparser';
import { DematAccount } from '../../../database/models/demat-account.js';
import { parse } from 'date-fns';
import { Logger } from '../../../core/logger.js';
import { ContractNoteProcessor } from './contract-note-processor.js';

const logger: Logger = new Logger('ZerodhaContractNoteProcessor');

export class ZerodhaContractNoteProcessor extends ContractNoteProcessor {
    processMail(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        if (parsedMail.from?.value[0].address === dematAccount.broker.broker_email_id) {
            let subject = parsedMail.subject;
            if (!subject) return undefined;
            let tokens: string[] = subject.split('-');
            let dateString = tokens[1].trim();
            return parse(dateString, 'MMMM dd, yyyy', new Date());
        }
        return undefined;
    }
}
