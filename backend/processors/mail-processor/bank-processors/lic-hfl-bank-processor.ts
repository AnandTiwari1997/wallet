import { BankProcessor } from './bank-processor.js';
import { ParsedMail } from 'mailparser';
import { Account } from '../../../database/models/account.js';
import { AccountTransaction } from '../../../database/models/account-transaction.js';
import { IBankProcessor, ProcessorFactory } from '../../processor-factory.js';
import { Logger } from '../../../core/logger.js';

const logger = new Logger('LicHFlBankProcessor');

export class LicHFlBankProcessor extends BankProcessor {
    processMail(parsedMail: ParsedMail, account: Account): AccountTransaction | undefined {
        let fromEmail = parsedMail.from?.value[0].address;
        if (!fromEmail) return;
        if (account.bank.alert_email_id === fromEmail) return;
        let processor: IBankProcessor | undefined = ProcessorFactory.getProcessor(fromEmail, '');
        if (!processor) return;
        let transaction = processor.processMail(parsedMail, account);
        if (transaction) {
            let bankProcessor = processor as BankProcessor;
            let mailText = bankProcessor.getMailText(parsedMail);
            let information = bankProcessor.getDescription(mailText);
            transaction.labels = ['LIC HFL', 'Loan Account', 'EMI Payment', information];
        }
        return transaction;
    }
}
