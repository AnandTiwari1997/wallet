import { SyncProvider } from '../models/sync-provider.js';
import { connection, eventEmitter } from './mail-service.js';
import { simpleParser } from 'mailparser';

export class BankAccountTransactionSyncProvider implements SyncProvider {
    sync(): void {
        eventEmitter.on('mail', (args) => {
            console.log(args);
            const mails: { numberOfNewMails: number; totalMails: number } = args;
            const iFetch = connection.seq.fetch(mails.totalMails + ':*', { bodies: '' });
            iFetch.on('message', function (msg, sequenceNumber) {
                msg.once('body', function (stream, info) {
                    simpleParser(stream, async (error, parsedMail) => {
                        if (error) return;
                        if (parsedMail.from?.text.includes('alerts@axisbank.com')) {
                            if (parsedMail.subject === 'Debit notification from Axis Bank') {
                                console.log(parsedMail.text);
                            }
                            if (parsedMail.subject === 'Credit notification from Axis Bank') {
                                console.log(parsedMail.text);
                            }
                        }
                    });
                });
            });
            iFetch.on('error', (error) => {});
            iFetch.on('end', () => {
                console.log(`Messages has been processed`);
            });
        });
    }
}
