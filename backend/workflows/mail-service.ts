import Connection, { Box } from 'imap';
import EventEmitter from 'events';
import { Logger } from '../core/logger.js';
import { mailServerParam } from '../config.js';

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
export const eventEmitter: EventEmitter = new EventEmitter();
let openedBox: Box | undefined = undefined;
connection.once('ready', () => {
    reconnectMailServer();
    logger.info(`Connection Established`);
    try {
        connection.openBox('INBOX', true, (err, box) => {
            if (err) return;
            if (!openedBox) eventEmitter.emit('boxOpened');
            openedBox = box;
            connection.subscribeBox('INBOX', (error) => {
                if (error) logger.error(error);
                logger.info('`INBOX` Subscribed');
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

// which will notify us of new messages
// Subscribe to the "mail" event,
connection.on('mail', onNewEmail);

connection.on('error', (error: any) => {
    logger.error(`Connection ${error}`);
    setTimeout((args) => {
        connection.connect();
    }, 30000);
});

connection.on('end', () => {
    logger.info(`Connection Ended`);
    setTimeout((args) => {
        connection.connect();
    }, 30000);
});

export const reconnectMailServer = () => {
    setInterval(() => {
        try {
            if (connection.state === 'disconnected') {
                logger.debug(`Email Connection Not Active [${connection.state}]. Reconnecting...`);
                connection.connect();
            }
        } catch (error) {}
    }, 60000);
};
