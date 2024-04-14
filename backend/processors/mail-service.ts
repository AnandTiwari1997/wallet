import Connection, { Box } from 'imap';
import { Logger } from '../core/logger.js';
import { mailServerParam } from '../config.js';
import { eventEmitter } from '../server.js';
import { newMailEventListener } from '../singleton.js';

const imapConfig = {
    user: mailServerParam.user,
    password: mailServerParam.password,
    host: mailServerParam.host,
    servername: mailServerParam.serverName,
    port: mailServerParam.port,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    },
    keepalive: {
        interval: 10000,
        idleInterval: 10000,
        forceNoop: true
    }
};
const logger: Logger = new Logger('MailService');
export const connection: Connection = new Connection(imapConfig);
let openedBox: Box | undefined = undefined;
connection.once('ready', () => {
    logger.info(`Mail Server Connection Established`);
    reconnectMailServer();
    newMailEventListener.refresh();
    try {
        connection.openBox('INBOX', true, (err, box) => {
            if (err) {
                logger.error(err);
                return;
            }
            if (!openedBox) {
                eventEmitter.emit('boxOpened');
            }
            openedBox = box;
            connection.subscribeBox('INBOX', (error) => {
                if (error) logger.error(error);
                logger.info('`INBOX` Subscribed');

                // which will notify us of new messages
                // Subscribe to the "mail" event,
                connection.on('mail', onNewEmail);
            });
        });
    } catch (error) {}
});

function onNewEmail(numberOfMails: number) {
    eventEmitter.emit('mail', {
        numberOfNewMails: numberOfMails,
        totalMails: openedBox ? openedBox.messages.total : 0
    });
}

connection.on('error', (error: any) => {
    logger.error(`Connection Error`);
    logger.error(error);
    setTimeout((args) => {
        logger.info(`Reconnecting to Mail Server`);
        connection.connect();
    }, 30000);
});

connection.on('end', () => {
    logger.info(`Connection Ended`);
    setTimeout(() => {
        logger.info(`Reconnecting to Mail Server`);
        connection.connect();
    }, 30000);
});

export const reconnectMailServer = () => {
    setInterval(() => {
        try {
            if (connection.state === 'disconnected') {
                logger.debug(`Mail Server Connection Not Active [${connection.state}]. Reconnecting...`);
                connection.connect();
            }
        } catch (error) {}
    }, 60000);
};
