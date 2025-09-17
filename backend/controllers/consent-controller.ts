import { Logger } from '../core/logger.js';
import express, { Request, Response } from 'express';
import { HttpRequestLogger } from '../core/api-middleware.js';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody, MessageResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { BadRequestError } from '../core/api-error.js';
import qs from 'qs';
import { inMemoryStorage } from '../database/repository/in-memory-storage.js';
import { getTokens } from '../utils/token-util.js';
import { consentRepository } from '../database/repository/consent-repository.js';
import { Consent } from '../database/models/consent.js';
import { compositeMailService } from '../processors/composite-mail-service.js';

import { MAIL_PROVIDERS } from '../utils/mail-providers.js';

export interface ProviderConfig {
    name: string;
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientId: string;
    clientSecret: string;
    imap: {
        host: string;
        port: number;
    };
    redirectUri: string;
}

const logger = new Logger('ConsentController');

const router = express.Router();
router.use(HttpRequestLogger);
router.get(
    '/provider/all',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<ProviderConfig>, ApiRequestBody<ProviderConfig>>,
            res: Response<ApiResponseBody<ProviderConfig>>
        ) => {
            let apiResponse: ApiResponseBody<ProviderConfig> = {
                num_found: MAIL_PROVIDERS.length,
                results: MAIL_PROVIDERS
            };
            return new SuccessResponse<ApiResponseBody<ProviderConfig>>(apiResponse).send(res);
        }
    )
);
router.get(
    '/provider/:provider',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<ProviderConfig>, ApiRequestBody<ProviderConfig>>,
            res: Response<ApiResponseBody<ProviderConfig>>
        ) => {
            let provider = req.params.provider;
            let providerConfig = MAIL_PROVIDERS.find((config) => config.name === provider);
            if (!providerConfig) {
                throw new BadRequestError('Provider not supported');
            }
            let apiResponse: ApiResponseBody<ProviderConfig> = {
                num_found: 1,
                results: [providerConfig]
            };
            return new SuccessResponse<ApiResponseBody<ProviderConfig>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/requested',
    AsyncApiHandler(
        async (
            req: Request<
                ApiRequestPathParam,
                MessageResponseBody<string>,
                ApiRequestBody<{ token: string; provider: string; email: string }>
            >,
            res: Response<MessageResponseBody<string>>
        ) => {
            let { token, provider, email } = req.body.data || { token: '', provider: '', email: '' };
            if (!token) throw new BadRequestError('No token provided');
            if (!email) throw new BadRequestError('No email provided');
            if (!provider) throw new BadRequestError('No provider provided');
            let existingConsents = inMemoryStorage.get('consents')?.value;
            if (!existingConsents) {
                existingConsents = {};
                inMemoryStorage.add({ key: 'consents', value: existingConsents });
            }
            if (!existingConsents[email]) {
                existingConsents[email] = { token, provider, email, expiration: new Date().getTime() + 1000 * 60 * 5 };
                inMemoryStorage.update({ key: 'consents', value: existingConsents });
            } else {
                res.send({ message: 'Consent is already request. Please check opened tabs.' });
            }
            const providerConfig = MAIL_PROVIDERS.find((config) => config.name === provider);
            const url = `${providerConfig?.authUrl}?${qs.stringify({
                client_id: providerConfig?.clientId,
                redirect_uri: providerConfig?.redirectUri,
                response_type: 'code',
                scope: providerConfig?.scopes.join(' '),
                access_type: 'offline',
                prompt: 'consent',
                state: Buffer.from(JSON.stringify({ token, provider, email })).toString('base64')
            })}`;
            return res.redirect(url);
        }
    )
);
router.get(
    '/callback',
    AsyncApiHandler(async (req, res) => {
        const { code, state } = req.query;

        const clientDataString = Buffer.from(state as string, 'base64').toString('utf8');
        const clientData: { token: string; provider: string; email: string } = JSON.parse(clientDataString);
        let existingConsents = inMemoryStorage.get('consents')?.value;
        if (!existingConsents || !existingConsents[clientData.email])
            throw new BadRequestError(
                'Either token is not valid or Consent session has been expire. Please request new consent.'
            );
        const providerConfig = MAIL_PROVIDERS.find((config) => config.name === clientData.provider);
        if (!providerConfig) throw new BadRequestError('Provider not supported');
        try {
            const { access_token, refresh_token, expires_in } = await getTokens(providerConfig, code);
            const consent = new Consent(
                clientData.email,
                clientData.provider,
                access_token,
                refresh_token,
                new Date(Date.now() + expires_in * 1000)
            );
            consentRepository.save(consent).then((value) => {
                compositeMailService.startMailServer(value);
            });
            res.send('Authorization successful. You can now close this window.');
        } catch (err: any) {
            console.error('Token exchange failed:', err.response?.data || err.message);
            res.send('Error during token exchange');
        }
    })
);
export default router;
