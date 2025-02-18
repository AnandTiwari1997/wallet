import { Logger } from '../core/logger.js';
import { ParsedMail, simpleParser } from 'mailparser';
import { ProcessorFactory } from '../processors/processor-factory.js';
import { IEventListener } from './event-listener.js';
import { eventEmitter } from '../server.js';
import { connection } from '../processors/mail-service.js';

const logger: Logger = new Logger('NewMailEventListener');

export class NewMailEventListener implements IEventListener {
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

    processRawMail(mails: { numberOfNewMails: number; totalMails: number }) {
        logger.info(
            `Mail Count: ${mails.numberOfNewMails}, Fetch Count: ${Math.abs(
                mails.totalMails - mails.numberOfNewMails + 1
            )}:${mails.totalMails}`
        );
        const iFetch = connection.seq.fetch(
            `${Math.abs(mails.totalMails - mails.numberOfNewMails + 1)}:${mails.totalMails}`,
            {
                bodies: ''
            }
        );
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
                    (error, parsedMail) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (!parsedMail.text && !parsedMail.html) return;
                        if (!parsedMail.from?.value[0].address) return;
                        eventEmitter.emit('parsed-mail', parsedMail);
                    }
                );
            });
        });
        iFetch.on('error', (err) => {
            logger.error(err);
        });
        iFetch.on('end', () => {
            logger.info('Mail consumed');
        });
    }

    listen(): void {
        eventEmitter.on('mail', this.processRawMail);
        eventEmitter.on('parsed-mail', this.processParsedMail);
        logger.info('Listeners Activated');
    }

    refresh(): void {
        eventEmitter.removeAllListeners('parsed-mail');
        eventEmitter.removeAllListeners('mail');
        logger.info('Listeners Deactivated');
        this.listen();
    }
}
