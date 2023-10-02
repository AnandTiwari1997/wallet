import Connection from 'imap';
import EventEmitter from 'events';

const imapConfig = {
    user: 'anandtiwari887@gmail.com',
    password: 'xjxmpiwwiiebzkwr',
    host: 'imap.gmail.com',
    servername: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    }
};

export const connection: Connection = new Connection(imapConfig);
export const eventEmitter: EventEmitter = new EventEmitter();

connection.once('ready', () => {
    console.log(`Connection Established`);
    connection.openBox('INBOX', true, (err, box) => {
        if (err) return;
        // Function to handle new email notifications
        function onNewEmail(numberOfMails: number) {
            console.log('New email received in INBOX!');
            // console.log({ numberOfNewMails: numberOfMails, totalMails: box.messages.total });
            eventEmitter.emit('mail', { numberOfNewMails: numberOfMails, totalMails: box.messages.total });
        }
        // Subscribe to the "mail" event, which will notify us of new messages
        connection.on('mail', onNewEmail);
        console.log('Listening for new emails...');
    });
});

connection.once('error', (error: any) => {
    console.log(`Connection Encountered Error ${error}`);
    connection.connect();
});

connection.once('end', () => {
    console.log(`Connection Ended`);
    connection.connect();
});
