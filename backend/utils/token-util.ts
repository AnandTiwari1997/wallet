import axios from 'axios';
import qs from 'qs';
import { ProviderConfig } from '../controllers/consent-controller.js';

export async function getTokens(
    providerConfig: ProviderConfig,
    grantCode: string | string[] | qs.ParsedQs | qs.ParsedQs[] | undefined
) {
    try {
        const response = await axios.post(
            providerConfig.tokenUrl,
            qs.stringify({
                code: grantCode,
                client_id: providerConfig.clientId,
                client_secret: providerConfig.clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: providerConfig.redirectUri
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            refresh_token: response.data.refresh_token
        };
    } catch (error: any) {
        console.error('Token exchange failed:', error.response?.data || error.message);
        throw error;
    }
}

export async function refreshAccessToken(providerConfig: ProviderConfig, refreshToken: string) {
    try {
        const response = await axios.post(
            providerConfig.tokenUrl,
            qs.stringify({
                client_id: providerConfig.clientId,
                client_secret: providerConfig.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            refresh_token: response.data.refresh_token || refreshToken
        };
    } catch (error: any) {
        console.error('Failed to refresh access token:', error.response?.data || error.message);
        throw error;
    }
}

export async function checkTokenExpirationAndRefresh(providerConfig: ProviderConfig, token: string) {

}

