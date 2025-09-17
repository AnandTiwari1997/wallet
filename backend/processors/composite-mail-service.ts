import { consentRepository } from '../database/repository/consent-repository.js';
import { MailService } from './mail-service.js';
import { refreshAccessToken } from '../utils/token-util.js';
import { eventEmitter } from '../server.js';
import { Consent } from '../database/models/consent.js';
import { Logger } from '../core/logger.js';

import { MAIL_PROVIDERS } from '../utils/mail-providers.js';

class CompositeMailService {
    private logger: Logger = new Logger('CompositeMailService');
    private mailServices: Map<string, MailService> = new Map();

    private buildXOAUTH2Token(email: string, accessToken: string) {
        const authString = [`user=${email}`, `auth=Bearer ${accessToken}`, '', ''].join('\x01');
        return Buffer.from(authString).toString('base64');
    }

    getConnection(email: string) {
        return this.mailServices.get(email)?.connection;
    }

    async startMailServer(consent: Consent) {
        if (this.mailServices.has(consent.email)) return;
        const provider = MAIL_PROVIDERS.find((provider) => provider.name == consent.provider);
        if (!provider) return;
        const config = {
            user: consent.email,
            password: this.buildXOAUTH2Token(consent.email, consent.access_token),
            xoauth2: this.buildXOAUTH2Token(consent.email, consent.access_token),
            host: provider.imap.host,
            servername: provider.name,
            port: provider.imap.port,
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
        const mailService = new MailService(config);
        mailService.setConnectionConfigUpdater(async () => {
            this.logger.info('Refreshing access token');
            const tokens = await refreshAccessToken(provider, consent.refresh_token);
            consent.access_token = tokens.access_token;
            consent.refresh_token = tokens.refresh_token;
            consent.expiration = new Date(Date.now() + tokens.expires_in * 1000);
            this.logger.info(`New tokens expiration set at ${consent.expiration}`);
            await consentRepository.update(consent.email, consent);
            this.logger.info('Tokens refreshed');
            return {
                user: consent.email,
                password: this.buildXOAUTH2Token(consent.email, consent.access_token),
                xoauth2: this.buildXOAUTH2Token(consent.email, consent.access_token),
                host: provider.imap.host,
                servername: provider.name,
                port: provider.imap.port,
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
        });
        mailService.connect();
        this.mailServices.set(consent.email, mailService);
        eventEmitter.emit('allBoxOpened');
    }

    async startMailServers() {
        const consents = await consentRepository.find();
        if (consents.length == 0) return;
        const syncPromises = consents.map((consent) => {
            this.startMailServer(consent);
        });
        await Promise.all(syncPromises);
        eventEmitter.emit('allBoxOpened');
    }
}

export const compositeMailService = new CompositeMailService();
