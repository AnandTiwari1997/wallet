import { ParsedMail } from 'mailparser';
import { DematAccount } from '../../../database/models/demat-account.js';
import { parse } from 'date-fns';
import { Logger } from '../../../core/logger.js';
import { ContractNoteProcessor } from './contract-note-processor.js';

const logger: Logger = new Logger('NextBillionContractNoteProcessor');

export class NextBillionContractNoteProcessor extends ContractNoteProcessor {
    processMail(parsedMail: ParsedMail, dematAccount: DematAccount): Date | undefined {
        if (parsedMail.from?.value[0].address === dematAccount.broker.broker_email_id) {
            let subject = parsedMail.subject;
            if (!subject) return undefined;
            let regex1 = new RegExp('\\d+-\\d+-\\d+');
            let regex2 = new RegExp('\\d+/\\d+/\\d+');
            let matchArray = subject.match(regex1) || subject.match(regex2);
            if (matchArray) {
                if (matchArray[0].includes('/')) {
                    return parse(matchArray[0], 'dd/MM/yyyy', new Date());
                } else {
                    return parse(matchArray[0], 'dd-MM-yyyy', new Date());
                }
            }
        }
        return undefined;
    }
}
