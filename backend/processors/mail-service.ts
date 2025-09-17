import Connection, { Box } from 'imap';
import { Logger } from '../core/logger.js';
import { eventEmitter } from '../server.js';
import { newMailEventListener } from '../singleton.js';

/**
 * MailService class handles the connection to the IMAP mail server,
 * listens for new emails, and emits events accordingly.
 */
export class MailService {
    private logger: Logger = new Logger('MailService');
    public connection: Connection;
    private openedBox: Box | undefined = undefined;
    private reconnectInterval: NodeJS.Timeout | undefined = undefined;
    private reconnectDelay = 30000; // 30 seconds
    private connectionCheckInterval = 60000; // 60 seconds
    private configUpdaterFn: (() => Promise<Connection.Config>) | undefined = undefined;
    private config: Connection.Config;

    /**
     * Constructs a new MailService instance, initializes the IMAP connection,
     * and binds event listeners.
     */
    constructor(config: Connection.Config) {
        this.config = config;
        this.connection = new Connection(config);
        this.bindEventListeners();
    }

    /**
     * Attempts to connect to the mail server.
     */
    public connect(): void {
        this.logger.info('Attempting to connect to mail server...');
        this.connection.connect();
    }

    /**
     * Binds the necessary event listeners to the IMAP connection.
     */
    private bindEventListeners(): void {
        this.connection.on('ready', this.onReady.bind(this));
        this.connection.on('error', this.onError.bind(this));
        this.connection.on('end', this.onEnd.bind(this));
    }

    /**
     * Called when the IMAP connection is established and ready.
     */
    private onReady(): void {
        this.logger.info(`Mail Server Connection Established for ${this.config.user}.`);
        newMailEventListener.refresh();
        this.openInbox();
        if (!this.reconnectInterval) {
            this.startConnectionCheck();
        }
    }

    /**
     * Opens the INBOX mailbox.
     */
    private openInbox(): void {
        this.connection.openBox('INBOX', true, (err, box) => {
            if (err) {
                this.logger.error('Failed to open INBOX:', err);
                return;
            }
            this.logger.info('INBOX opened successfully.');
            this.openedBox = box;
            eventEmitter.emit('boxOpened');

            this.connection.subscribeBox('INBOX', (error) => {
                if (error) {
                    this.logger.error('Failed to subscribe to INBOX:', error);
                }
                this.connection.on('mail', this.onNewEmail.bind(this));
            });
        });
    }

    /**
     * Called when a new email arrives in the INBOX.
     * @param numberOfNewMails The number of new emails.
     */
    private onNewEmail(numberOfNewMails: number): void {
        const email = this.config.user;
        if (this.openedBox) {
            eventEmitter.emit('mail', {
                email,
                numberOfNewMails,
                totalMails: this.openedBox.messages.total
            });
        } else {
            this.logger.info('Received new mail event, but INBOX is not open.');
        }
    }

    /**
     * Called when a connection error occurs.
     * @param err The error that occurred.
     */
    private onError(err: Error): void {
        this.logger.error('Connection Error:', err);
        this.openedBox = undefined;
        this.reconnect('CONNECTION_ERROR');
    }

    /**
     * Called when the connection to the server has ended.
     */
    private onEnd(): void {
        this.logger.info('Connection Ended.');
        this.openedBox = undefined;
        // this.reconnect('CONNECTION_ENDED');
    }

    /**
     * Schedules a reconnection attempt after a delay.
     */
    private reconnect(reason: string): void {
        this.logger.info(`Scheduling reconnect in ${this.reconnectDelay / 1000} seconds due to ${reason}`);
        setTimeout(async () => {
            if (this.configUpdaterFn) {
                this.config = await this.configUpdaterFn();
                this.connection = new Connection(this.config);
                this.bindEventListeners();
            }
            this.connect();
        }, this.reconnectDelay);
    }

    setConnectionConfigUpdater(updaterFn: () => Promise<Connection.Config>): void {
        this.configUpdaterFn = updaterFn;
    }

    /**
     * Starts a periodic check to ensure the connection is still active.
     */
    private startConnectionCheck(): void {
        this.logger.info(`Starting connection health check every ${this.connectionCheckInterval / 1000}s.`);
        this.reconnectInterval = setInterval(() => {
            try {
                if (this.connection.state === 'disconnected') {
                    this.logger.debug(`Mail Server Connection Not Active [${this.connection.state}]. Reconnecting...`);
                    this.reconnect('DISCONNECTED');
                }
            } catch (error) {
                this.logger.error('Error during health check:', error);
            }
        }, this.connectionCheckInterval);
    }
}
