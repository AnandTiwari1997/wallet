import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { connection, reconnectMailServer } from './workflows/mail-service.js';
import accountRoutes from './controllers/account-controller.js';
import bankRoutes from './controllers/bank-controller.js';
import transactionRoutes from './controllers/transactions-controller.js';
import investmentFundRoutes from './controllers/investment-fund-controller.js';
import { BankAccountTransactionSyncProvider } from './workflows/sync-providers/bank-account-transaction-sync-provider.js';
import { Logger, LoggerLevel } from './core/logger.js';
import { ApiError, ErrorType, InternalError, NotFoundError } from './core/api-error.js';
import { API_PATH } from './constant.js';
import { environment, port } from './config.js';

Logger.level = LoggerLevel.DEBUG;

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

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
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
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    bankAccountTransactionSyncProvider.sync();
});
