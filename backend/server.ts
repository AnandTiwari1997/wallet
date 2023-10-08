import express from 'express';
import cors from 'cors';
import { API_PATH } from './constant.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { connection, reconnectMailServer } from './workflows/mail-service.js';
import { _getInvestmentTransactions, _investmentSyncCaptcha, _syncInvestment } from './controllers/investment-fund-controller.js';
import { _addAccount, _getAccounts, _syncAccount, _syncAccounts } from './controllers/account-controller.js';
import { _getAccountTransactions, _getTransactions } from './controllers/transactions.js';
import { BankAccountTransactionSyncProvider } from './workflows/bank-account-transaction-sync-provider.js';
import { Logger, LoggerLevel } from './logger/logger.js';
import { _getBanks } from './controllers/bank-controller.js';

Logger.level = LoggerLevel.DEBUG;

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
export const rootDirectoryPath = path.dirname(path.dirname(__filename));
const logger: Logger = new Logger('Server Main');

app.listen(port, () => {
    logger.info(`Backend Server Started listening on ${port}`);
    connection.connect();
    reconnectMailServer();
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    bankAccountTransactionSyncProvider.sync();
});

// Bank Controller
app.get(API_PATH.GET_BANKS, _getBanks);

// Account Controller
app.get(API_PATH.GET_ACCOUNTS, _getAccounts);
app.post(API_PATH.ADD_ACCOUNT, _addAccount);
app.get(API_PATH.SYNC_ACCOUNT, _syncAccount);
app.get(API_PATH.SYNC_ALL_ACCOUNT, _syncAccounts);

// Account Transaction Controller
app.post(API_PATH.GET_ALL_ACCOUNTS_TRANSACTIONS, _getTransactions);
app.get(API_PATH.GET_ACCOUNT_TRANSACTIONS, _getAccountTransactions);

// Investment Fund Controller
app.post(API_PATH.GET_INVESTMENT_TRANSACTIONS, _getInvestmentTransactions);
app.get(API_PATH.SYNC_INVESTMENT, _syncInvestment);
app.post(API_PATH.POST_INVESTMENT_SYNC_CAPTCHA, _investmentSyncCaptcha);
