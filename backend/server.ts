import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { connection, eventEmitter } from './workflows/mail-service.js';
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
import { environment, port } from './config.js';
import { accountRepository } from './database/repository/account-repository.js';
import { bankAccountTransactionSyncProvider } from './workflows/sync-providers/bank-account-transaction-sync-provider.js';
import { loanAccountTransactionSyncProvider } from './workflows/sync-providers/loan-account-transaction-sync-provider.js';
import { billSyncProvider } from './workflows/sync-providers/bills-sync-provider.js';
import { creditCardSyncProvider } from './workflows/sync-providers/credit-card-sync-provider.js';
import { holdingRepository } from './database/repository/holding-repository.js';
import { stockLatestTradingPriceSynProvider } from './workflows/sync-providers/stock-latest-trading-price-sync-provider.js';
import { dematAccountRepository } from './database/repository/demat-account-repository.js';
import { mutualFundRepository } from './database/repository/mutual-fund-repository.js';
import { mutualFundNavSyncProvider } from './workflows/sync-providers/mutual-fund-latest-nav-sync-provider.js';
import { dematAccountSyncProvider } from './workflows/sync-providers/demat-account-sync-provider.js';

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
router.use(API_PATH.STOCKS, stocksRoutes);
router.use(API_PATH.DEMAT_ACCOUNT, dematAccountRoutes);
router.use(API_PATH.BROKERS, brokerRoutes);
router.use(API_PATH.HOLDING, holdingRoutes);

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
    eventEmitter.addListener('boxOpened', async () => {
        let bankAccounts = await accountRepository.findAll({ filters: [{ key: 'account_type', value: 'BANK' }] });
        bankAccountTransactionSyncProvider.manualSync(bankAccounts, true);
        let loanAccounts = await accountRepository.findAll({ filters: [{ key: 'account_type', value: 'LOAN' }] });
        loanAccountTransactionSyncProvider.manualSync(loanAccounts, true);
        let creditCardAccounts = await accountRepository.findAll({
            filters: [
                {
                    key: 'account_type',
                    value: 'CREDIT_CARD'
                }
            ]
        });
        creditCardSyncProvider.manualSync(creditCardAccounts, true);
        // manualStockAddition();
        let dematAccounts = await dematAccountRepository.findAll({});
        dematAccountSyncProvider.manualSync(dematAccounts, true);
        let holdings = await holdingRepository.findAll({});
        stockLatestTradingPriceSynProvider.manualSync(holdings, false);
        let mutualFunds = await mutualFundRepository.findAllDistinctFundByISIN();
        mutualFundNavSyncProvider.manualSync(mutualFunds, false);
        billSyncProvider.sync();
    });
});

const manualStockAddition = () => {
    let data = [
        {
            order_no: '1100000019328833',
            stock_isin: 'INE090A01021',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 594.7,
            amount: -1189.4,
            transaction_date: '01-Feb-2021 13:56:34'
        },
        {
            order_no: '1100000019592543',
            stock_isin: 'INE043D01016',
            transaction_type: 'B',
            stock_quantity: 10.0,
            stock_transaction_price: 42.6,
            amount: -426.0,
            transaction_date: '01-Feb-2021 14:00:36'
        },
        {
            order_no: '1100000024462279',
            stock_isin: 'INE043D01016',
            transaction_type: 'S',
            stock_quantity: -10.0,
            stock_transaction_price: 43.25,
            amount: 432.5,
            transaction_date: '01-Feb-2021 15:22:14'
        },
        {
            order_no: '1300000000972495',
            stock_isin: 'INE062A01020',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 321.5,
            amount: -1607.5,
            transaction_date: '02-Feb-2021 09:19:36'
        },
        {
            order_no: '1612236600056086135',
            stock_isin: 'INE090A01021',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 618.85,
            amount: -1237.7,
            transaction_date: '02-Feb-2021 09:29:37'
        },
        {
            order_no: '1300000024202524',
            stock_isin: 'INE062A01020',
            transaction_type: 'S',
            stock_quantity: -5.0,
            stock_transaction_price: 331.3,
            amount: 1656.5,
            transaction_date: '02-Feb-2021 15:22:20'
        },
        {
            order_no: '1612254451724190094',
            stock_isin: 'INE090A01021',
            transaction_type: 'S',
            stock_quantity: -2.0,
            stock_transaction_price: 619.65,
            amount: 1239.3,
            transaction_date: '02-Feb-2021 15:23:34'
        },
        {
            order_no: '1100000002533129',
            stock_isin: 'INE043D01016',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 43.8,
            amount: -219.0,
            transaction_date: '03-Feb-2021 09:34:04'
        },
        {
            order_no: '1100000002604094',
            stock_isin: 'INE095A01012',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 1013.7,
            amount: -1013.7,
            transaction_date: '03-Feb-2021 09:34:47'
        },
        {
            order_no: '1000000003221863',
            stock_isin: 'INE814H01011',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 52.95,
            amount: -264.75,
            transaction_date: '03-Feb-2021 09:35:02'
        },
        {
            order_no: '1100000003415879',
            stock_isin: 'INE053F01010',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 24.2,
            amount: -121.0,
            transaction_date: '04-Feb-2021 09:43:30'
        },
        {
            order_no: '1200000013203805',
            stock_isin: 'INE160A01022',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 39.45,
            amount: -39.45,
            transaction_date: '04-Feb-2021 13:19:00'
        },
        {
            order_no: '1100000001812702',
            stock_isin: 'INE053F01010',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 25.9,
            amount: -25.9,
            transaction_date: '05-Feb-2021 09:24:56'
        },
        {
            order_no: '1100000001796800',
            stock_isin: 'INE053F01010',
            transaction_type: 'B',
            stock_quantity: 15.0,
            stock_transaction_price: 25.85,
            amount: -387.75,
            transaction_date: '08-Feb-2021 09:29:32'
        },
        {
            order_no: '1300000002105975',
            stock_isin: 'INE245A01021',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 90.15,
            amount: -450.75,
            transaction_date: '08-Feb-2021 09:30:15'
        },
        {
            order_no: '1612755000066079992',
            stock_isin: 'INE160A01022',
            transaction_type: 'B',
            stock_quantity: 4.0,
            stock_transaction_price: 40.3,
            amount: -161.2,
            transaction_date: '08-Feb-2021 09:30:30'
        },
        {
            order_no: '1000000000168831',
            stock_isin: 'INE029A01011',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 431.0,
            amount: -431.0,
            transaction_date: '09-Feb-2021 09:07:26'
        },
        {
            order_no: '1100000009575184',
            stock_isin: 'INE092T01019',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 62.95,
            amount: -62.95,
            transaction_date: '26-Feb-2021 11:16:37'
        },
        {
            order_no: '1300000018007124',
            stock_isin: 'INE245A01021',
            transaction_type: 'B',
            stock_quantity: 10.0,
            stock_transaction_price: 99.8,
            amount: -998.0,
            transaction_date: '02-Mar-2021 14:46:47'
        },
        {
            order_no: '1100000008778215',
            stock_isin: 'INE092T01019',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 66.8,
            amount: -334.0,
            transaction_date: '03-Mar-2021 12:02:41'
        },
        {
            order_no: '1000000012059868',
            stock_isin: 'INE814H01011',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 65.45,
            amount: -327.25,
            transaction_date: '03-Mar-2021 12:02:54'
        },
        {
            order_no: '1000000006374218',
            stock_isin: 'INE028A01039',
            transaction_type: 'B',
            stock_quantity: 4.0,
            stock_transaction_price: 85.8,
            amount: -343.2,
            transaction_date: '04-Mar-2021 10:13:26'
        },
        {
            order_no: '1100000006983842',
            stock_isin: 'INE019C01026',
            transaction_date: '14-Jul-2021 11:26:27',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 56.25,
            amount: -56.25
        },
        {
            order_no: '1100000007001915',
            stock_isin: 'INE019C01026',
            transaction_date: '14-Jul-2021 11:27:02',
            transaction_type: 'S',
            stock_quantity: -1.0,
            stock_transaction_price: 56.15,
            amount: 56.15
        },
        {
            order_no: '1100000004427219',
            stock_isin: 'INE019C01026',
            transaction_date: '13-Jul-2021 10:10:01',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 56.2,
            amount: -281.0
        },
        {
            order_no: '1100000004427219',
            stock_isin: 'INE019C01026',
            transaction_date: '13-Jul-2021 10:10:01',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 56.2,
            amount: -56.2
        },
        {
            order_no: '1300000000554461',
            stock_isin: 'INE614G01033',
            transaction_date: '22-Jun-2021 09:16:26',
            transaction_type: 'B',
            stock_quantity: 10.0,
            stock_transaction_price: 17.4,
            amount: -174.0
        },
        {
            order_no: '1100000001918593',
            stock_isin: 'INE019C01026',
            transaction_date: '25-Jun-2021 09:35:44',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 59.75,
            amount: -119.5
        },
        {
            order_no: '1624591800001246085',
            stock_isin: 'INE337E01010',
            transaction_date: '25-Jun-2021 09:34:10',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 177.5,
            amount: -177.5
        },
        {
            order_no: '1300000002927481',
            stock_isin: 'INE614G01033',
            transaction_date: '06-Aug-2021 09:38:16',
            transaction_type: 'S',
            stock_quantity: -50.0,
            stock_transaction_price: 12.6,
            amount: 630.0
        },
        {
            order_no: '1100000006703746',
            stock_isin: 'INE019C01026',
            transaction_date: '22-Jul-2021 10:41:39',
            transaction_type: 'B',
            stock_quantity: 3.0,
            stock_transaction_price: 52.85,
            amount: -158.55
        },
        {
            order_no: '1628747671875062967',
            stock_isin: 'INE019C01026',
            transaction_date: '12-Aug-2021 12:17:07',
            transaction_type: 'B',
            stock_quantity: 7.0,
            stock_transaction_price: 48.9,
            amount: -342.3
        },
        {
            order_no: '1628739000001120497',
            stock_isin: 'INE337E01010',
            transaction_date: '12-Aug-2021 12:17:23',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 219.5,
            amount: -1097.5
        },
        {
            order_no: '1300000007506865',
            stock_isin: 'INE114A01011',
            transaction_date: '20-Sep-2021 10:39:30',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 110.6,
            amount: -110.6
        },
        {
            order_no: '1300000007631138',
            stock_isin: 'INE114A01011',
            transaction_date: '20-Sep-2021 10:41:35',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 110.95,
            amount: -110.95
        },
        {
            order_no: '1100000004260597',
            stock_isin: 'INE053F01010',
            transaction_date: '07-Jun-2021 10:03:01',
            transaction_type: 'B',
            stock_quantity: 4.0,
            stock_transaction_price: 24.65,
            amount: -98.6
        },
        {
            order_no: '1623036600001066140',
            stock_isin: 'INE337E01010',
            transaction_date: '07-Jun-2021 09:58:41',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 197.2,
            amount: -394.4
        },
        {
            order_no: '1100000003353830',
            stock_isin: 'INE092T01019',
            transaction_date: '01-Jun-2021 09:52:09',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 58.7,
            amount: -58.7
        },
        {
            order_no: '1100000015282442',
            stock_isin: 'INE092T01019',
            transaction_date: '08-Jun-2021 14:46:52',
            transaction_type: 'B',
            stock_quantity: 3.0,
            stock_transaction_price: 59.45,
            amount: -178.35
        },
        {
            order_no: '1100000015146568',
            stock_isin: 'INE095A01012',
            transaction_date: '08-Jun-2021 14:43:41',
            transaction_type: 'S',
            stock_quantity: -1.0,
            stock_transaction_price: 1023.9,
            amount: 1023.9
        },
        {
            order_no: '1300000006122201',
            stock_isin: 'INE614G01033',
            transaction_date: '08-Jun-2021 10:11:04',
            transaction_type: 'B',
            stock_quantity: 40.0,
            stock_transaction_price: 10.85,
            amount: -434.0
        },
        {
            order_no: '1300000011730869',
            stock_isin: 'INE245A01021',
            transaction_date: '09-Jun-2021 11:50:55',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 128.4,
            amount: -642.0
        },
        {
            order_no: '1000000021554925',
            stock_isin: 'INE814H01011',
            transaction_date: '27-May-2021 15:41:10',
            transaction_type: 'B',
            stock_quantity: 5.0,
            stock_transaction_price: 95.15,
            amount: -475.75
        },
        {
            order_no: '1620790200002112526',
            stock_isin: 'INE337E01010',
            transaction_date: '12-May-2021 10:45:45',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 206.5,
            amount: -413.0
        },
        {
            order_no: '1000000004482172',
            stock_isin: 'INE029A01011',
            transaction_date: '11-May-2021 09:50:07',
            transaction_type: 'S',
            stock_quantity: -1.0,
            stock_transaction_price: 462.2,
            amount: 462.2
        },
        {
            order_no: '1100000009914322',
            stock_isin: 'INE019C01026',
            transaction_date: '17-Jun-2021 12:42:12',
            transaction_type: 'B',
            stock_quantity: 2.0,
            stock_transaction_price: 60.05,
            amount: -120.1
        },
        {
            order_no: '1300000006880818',
            stock_isin: 'INE114A01011',
            transaction_date: '10-Jun-2021 10:35:20',
            transaction_type: 'B',
            stock_quantity: 1.0,
            stock_transaction_price: 126.95,
            amount: -126.95
        }
    ];
    dematAccountRepository.find('1208160059605976').then((dematAccount) => {
        if (!dematAccount) return;
        eventEmitter.emit('stock', ['start', dematAccount]);
        eventEmitter.emit('stock', data);
        eventEmitter.emit('stock', ['end', dematAccount]);
    });
};
