import { ProviderConfig } from '../controllers/consent-controller.js';

export const MAIL_PROVIDERS: ProviderConfig[] = [
    {
        name: 'gmail',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: ['https://mail.google.com/'],
        clientId: 'YOUR_GMAIL_CLIENT_ID',
        clientSecret: 'YOUR_GMAIL_CLIENT_SECRET',
        imap: {
            host: 'imap.gmail.com',
            port: 993
        },
        redirectUri: 'http://localhost:8000/wallet/consent/callback'
    },
    {
        name: 'outlook',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scopes: ['https://outlook.office.com/IMAP.AccessAsUser.All'],
        clientId: 'YOUR_OUTLOOK_CLIENT_ID',
        clientSecret: 'YOUR_OUTLOOK_CLIENT_SECRET',
        imap: {
            host: 'outlook.office365.com',
            port: 993
        },
        redirectUri: '/wallet/consent/callback'
    },
    {
        name: 'yahoo',
        authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
        tokenUrl: 'https://api.login.yahoo.com/oauth2/get_token',
        scopes: ['mail-r'],
        clientId: 'YOUR_YAHOO_CLIENT_ID',
        clientSecret: 'YOUR_YAHOO_CLIENT_SECRET',
        imap: {
            host: 'imap.mail.yahoo.com',
            port: 993
        },
        redirectUri: '/consent/callback'
    }
];