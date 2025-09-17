import { Logger } from '../core/logger.js';
import { ParsedMail, simpleParser } from 'mailparser';
import { ProcessorFactory } from '../processors/processor-factory.js';
import { IEventListener } from './event-listener.js';
import { eventEmitter } from '../server.js';
import { compositeMailService } from '../processors/composite-mail-service.js';

const logger: Logger = new Logger('NewMailEventListener');

/**
 * Defines the events related to mail processing.
 */
const MailEvents = {
    NEW_MAIL: 'mail',
    PARSED_MAIL: 'parsed-mail'
};

/**
 * Listens for new mail events and processes them.
 */
export class NewMailEventListener implements IEventListener {
    /**
     * Processes a parsed email message.
     * @param parsedMail The parsed email message.
     */
    processParsedMail(parsedMail: ParsedMail) {
        logger.info('Mail Processing Started');
        let fromEmail = parsedMail.from?.value[0].address;
        if (!fromEmail) {
            logger.error(`Rejected Mail - From ${fromEmail}, Reason: Not Valid Sender`);
            return;
        }
        let subject = parsedMail.subject;
        let processor = ProcessorFactory.getProcessor(fromEmail, subject);
        if (!processor) {
            logger.error(`Rejected Mail - From: ${fromEmail}, Subject: ${subject}, Reason: No Valid Processor`);
            return;
        }
        processor.process(parsedMail);
    }

    /**
     * Processes raw email messages from the server.
     * @param mails An object containing the number of new mails and total mails.
     */
    processRawMail(mails: { email: string; numberOfNewMails: number; totalMails: number }) {
        logger.info('Mail Count : ', mails.numberOfNewMails);
        if (mails.numberOfNewMails === 0) {
            return;
        }
        const startSequence = mails.totalMails - mails.numberOfNewMails + 1;
        const fetchRange = `${startSequence}:${mails.totalMails}`;
        const connection = compositeMailService.getConnection(mails.email);
        if (!connection) return;
        const iFetch = connection.seq.fetch(fetchRange, { bodies: '' });
        iFetch.on('message', (msg, sequenceNumber) => {
            msg.once('body', (stream) => {
                simpleParser(
                    stream,
                    {
                        skipImageLinks: true,
                        skipTextLinks: true,
                        skipHtmlToText: false,
                        skipTextToHtml: true,
                        keepCidLinks: false,
                        decodeStrings: true
                    },
                    async (error, parsedMail) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (!parsedMail.text) return;
                        if (!parsedMail.from?.value[0].address) return;
                        eventEmitter.emit('parsed-mail', parsedMail);
                    }
                );
            });
        });
        iFetch.once('error', (err) => {
            logger.error(`Error fetching mails: ${err.message}`);
        });
        iFetch.once('end', () => {
            logger.info('Finished fetching new mails.');
        });
    }

    /**
     * Sets up the event listeners for new and parsed mail.
     */
    listen(): void {
        eventEmitter.on(MailEvents.NEW_MAIL, this.processRawMail.bind(this));
        eventEmitter.on(MailEvents.PARSED_MAIL, this.processParsedMail.bind(this));
        logger.info('Listeners Activated');
    }

    /**
     * Refreshes the event listeners by removing and re-adding them.
     */
    refresh(): void {
        eventEmitter.removeAllListeners(MailEvents.PARSED_MAIL);
        eventEmitter.removeAllListeners(MailEvents.NEW_MAIL);
        logger.info('Listeners Deactivated');
        this.listen();
    }
}
