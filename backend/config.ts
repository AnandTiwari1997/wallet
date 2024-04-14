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
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MILLIS || '10000'),
    loggingEnabled: process.env.DB_LOGGING_ENABLED === 'true'
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

export const electricityVendors = [
    {
        value: 'MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD',
        label: 'Maharashtra State Electricity Distribution Co. Ltd.'
    },
    {
        value: 'M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD',
        label: 'M.P. Pashchim Kshetra Vidyut Vitaran Co. Ltd.'
    }
];

export const electricityVendorMap: { [key: string]: string } = {
    'M.P. Pashchim Kshetra Vidyut Vitaran Co. Ltd.': 'M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD',
    'Maharashtra State Electricity Distribution Co. Ltd.': 'MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD'
};

export const electricityParam = {
    MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD: {
        due_date_xpath: '//*[@id="billingTable"]/tbody/tr[2]/td[7]',
        bill_amount_xpath: '//*[@id="billingTable"]/tbody/tr[2]/td[6]'
    },
    M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD: {
        due_date_xpath: '//*[@id="iframe"]/div[1]/div/div/div[2]/div[1]/table/tbody/tr[2]/td[2]',
        bill_amount_xpath: '//*[@id="iframe"]/div[1]/div/div/div[2]/div[1]/table/tbody/tr[3]/td[2]'
    }
};
