import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import accountRoutes from './controllers/account-controller.js';
import bankRoutes from './controllers/bank-controller.js';
import transactionRoutes from './controllers/transactions-controller.js';
import investmentFundRoutes from './controllers/investment-fund-controller.js';
import billsRoutes from './controllers/bill-controller.js';
import stocksRoutes from './controllers/stock-transaction-controller.js';
import dematAccountRoutes from './controllers/demat-account-controller.js';
import brokerRoutes from './controllers/broker-controller.js';
import holdingRoutes from './controllers/stock-holding-controller.js';
import { Logger, LoggerLevel } from './core/logger.js';
import { ApiError, ErrorType, InternalError, NotFoundError } from './core/api-error.js';
import { API_PATH } from './constant.js';
import { environment, port, startMailServer } from './config.js';
import { DematAccount } from './database/models/demat-account.js';
import { dematAccountRepository } from './database/repository/demat-account-repository.js';
import { PythonUtil } from './utils/python-util.js';
import { connection } from './processors/mail-service.js';
import EventEmitter from 'events';
import { mutualFundLatestNavScheduler, schedulers, stockLatestTradingPriceScheduler } from './singleton.js';
import { syncTrackerRepository } from './database/repository/sync-tracker-repository.js';
import { AsyncApiHandler } from './core/api-handler.js';
import { ApiRequestPathParam } from './types/api-request-path-param.js';
import { ApiRequestBody } from './types/api-request-body.js';
import { SuccessResponse } from './core/api-response.js';

Logger.level = LoggerLevel.INFO;
let HEALTH: string = 'DOWN';
export const eventEmitter: EventEmitter = new EventEmitter();

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
router.use(API_PATH.STOCKS, stocksRoutes);
router.use(API_PATH.DEMAT_ACCOUNT, dematAccountRoutes);
router.use(API_PATH.BROKERS, brokerRoutes);
router.use(API_PATH.HOLDING, holdingRoutes);
router.get(
    '/wallet/health',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, { health: string }, ApiRequestBody<{}>>,
            res: Response<{ health: string }>
        ) => {
            return new SuccessResponse<{ health: string }>({ health: HEALTH }).send(res);
        }
    )
);

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use('/', router);
app.use((req, res, next) => next(new NotFoundError()));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL)
            logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
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
    PythonUtil.installDependencies();
    logger.info(`Backend Server Started listening on ${port}`);
    HEALTH = 'UP';
    if (startMailServer) {
        connection.connect();
    }
    eventEmitter.addListener('boxOpened', async () => {
        await syncTrackerRepository.query(
            "UPDATE sync_tracker SET sync_status='FAILED', sync_ended_At = now() WHERE sync_status = 'IN_PROGRESS'"
        );
        schedulers.schedule();
        mutualFundLatestNavScheduler.schedule();
        stockLatestTradingPriceScheduler.schedule();
    });
});

const manualStockAddition = () => {
    let data: any[] = [];
    dematAccountRepository
        .find({
            relations: {
                broker: true
            },
            where: {
                broker_id: '1208160059605976'
            }
        })
        .then((dematAccount: DematAccount[]) => {
            if (!dematAccount) return;
            eventEmitter.emit('stock', ['start', dematAccount]);
            eventEmitter.emit('stock', data);
            eventEmitter.emit('stock', ['end', dematAccount]);
        });
};
