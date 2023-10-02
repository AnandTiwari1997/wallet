import express from 'express';
import { mutualFundTransactionRaw, providentFundTransactionRaw } from './transaction-data.js';
import cors from 'cors';
import { MutualFundTransactionBuilder } from './models/mutual-fund-transaction.js';
import { mutualFundStorage } from './storage/mutual-fund-storage.js';
import { providentFundStorage } from './storage/provident-fund-storage.js';
import { ProvidentFundTransactionBuilder } from './models/provident-fund-transaction.js';
import { API_PATH } from './constant.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { connection } from './workflows/mail-service.js';
import {
    _getInvestmentTransactions,
    _investmentSyncCaptcha,
    _syncInvestment
} from './controllers/investment-fund-controller.js';
import { _getAccounts } from './controllers/account-controller.js';
import { _getAccountTransactions, _getTransactions } from './controllers/transactions.js';
import { BankAccountTransactionSyncProvider } from './workflows/bank-account-transaction-sync-provider.js';

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
export const rootDirectoryPath = path.dirname(path.dirname(__filename));

app.listen(port, () => {
    console.log('Backend Server Started listening on 8000....');
    console.log('Preparing Results for API calls');
    mutualFundTransactionRaw.forEach((value) => {
        mutualFundStorage.add(MutualFundTransactionBuilder.build(value));
    });
    providentFundTransactionRaw.forEach((value) => {
        providentFundStorage.add(ProvidentFundTransactionBuilder.build(value));
    });
    connection.connect();
    setInterval(() => {
        if (connection.state !== 'connected') {
            console.log('[Server Main] Email Connection Not Active. Reconnecting...');
            connection.connect();
        }
    }, 60000 * 5);
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    bankAccountTransactionSyncProvider.sync();
});

app.get(API_PATH.GET_ACCOUNTS, _getAccounts);
app.get(API_PATH.SYNC_ACCOUNT, _getAccounts);
app.post(API_PATH.GET_ALL_ACCOUNTS_TRANSACTIONS, _getTransactions);
app.get(API_PATH.GET_ACCOUNT_TRANSACTIONS, _getAccountTransactions);
app.post(API_PATH.GET_INVESTMENT_TRANSACTIONS, _getInvestmentTransactions);
app.get(API_PATH.SYNC_INVESTMENT, _syncInvestment);
app.post(API_PATH.POST_INVESTMENT_SYNC_CAPTCHA, _investmentSyncCaptcha);
