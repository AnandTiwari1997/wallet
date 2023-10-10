import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
export const rootDirectoryPath = path.dirname(path.dirname(__filename));
dotenv.config({
    path: rootDirectoryPath + '/.env'
});

export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;
export const dataDir = process.env.DATA_DIR;
export const dbParam = {
    name: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || '',
    password: process.env.DB_USER_PWD || '',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '5'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MILLIS || '10000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MILLIS || '10000')
};
export const corsUrl = process.env.CORS_URL;
export const mailServerParam = {
    host: process.env.MAIL_HOST || '',
    serverName: process.env.MAIL_SERVER_NAME || '',
    port: parseInt(process.env.MAIL_PORT || '993'),
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || ''
};

export const pfParam = {
    username: process.env.PF_USERNAME || '',
    password: process.env.PF_PASSWORD || ''
};

export const mfParam = {
    email: process.env.MF_EMAIL || '',
    panNo: process.env.MF_PAN_NO || '',
    password: process.env.MF_PASSWORD || ''
};
