import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { connection, reconnectMailServer } from './workflows/mail-service.js';
import accountRoutes from './controllers/account-controller.js';
import bankRoutes from './controllers/bank-controller.js';
import transactionRoutes from './controllers/transactions-controller.js';
import investmentFundRoutes from './controllers/investment-fund-controller.js';
import billsRoutes from './controllers/bill-controller.js';
import { Logger, LoggerLevel } from './core/logger.js';
import { ApiError, ErrorType, InternalError, NotFoundError } from './core/api-error.js';
import { API_PATH } from './constant.js';
import { environment, port } from './config.js';
import { billSyncProvider } from './workflows/sync-providers/bills-sync-provider.js';
import { bankAccountTransactionSyncProvider } from './workflows/sync-providers/bank-account-transaction-sync-provider.js';
import { accountRepository } from './database/repository/account-repository.js';
import { loanAccountTransactionSyncProvider } from './workflows/sync-providers/loan-account-transaction-sync-provider.js';

Logger.level = LoggerLevel.INFO;

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

const __filename = fileURLToPath(import.meta.url);
export const rootDirectoryPath = path.dirname(path.dirname(__filename));
const logger: Logger = new Logger('Server Main');

const router = express.Router();
router.use(API_PATH.ACCOUNTS, accountRoutes);
router.use(API_PATH.BANKS, bankRoutes);
router.use(API_PATH.TRANSACTIONS, transactionRoutes);
router.use(API_PATH.INVESTMENTS, investmentFundRoutes);
router.use(API_PATH.BILLS, billsRoutes);

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use('/', router);
app.use((req, res, next) => next(new NotFoundError()));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL) logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    } else {
        logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err);
        if (environment === 'development') {
            return res.status(500).send(err);
        }
        ApiError.handle(new InternalError(), res);
    }
});

app.listen(port, () => {
    logger.info(`Backend Server Started listening on ${port}`);
    connection.connect();
    reconnectMailServer();

    bankAccountTransactionSyncProvider.sync();
    billSyncProvider.sync();

    // TODO: Remove this and rely on event raised when mail box is opened.
    setTimeout(() => {
        accountRepository.findAll({ filters: [{ key: 'account_type', value: 'BANK' }] }).then((accounts) => {
            bankAccountTransactionSyncProvider.manualSync(accounts, true);
        });
    }, 1000 * 60);

    setTimeout(() => {
        accountRepository.findAll({ filters: [{ key: 'account_type', value: 'LOAN' }] }).then((accounts) => {
            loanAccountTransactionSyncProvider.manualSync(accounts, true);
        });
    }, 1000 * 60);
});
