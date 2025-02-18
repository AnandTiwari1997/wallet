import { IEventListener } from './event-listener.js';
import { eventEmitter } from '../server.js';
import { DematAccount } from '../database/models/demat-account.js';
import { ALL_STOCKS, ArrayUtil } from '../constant.js';
import { parse } from 'date-fns';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { StockTransaction } from '../database/models/stock-transaction.js';
import { randomUUID } from 'crypto';
import { stockTransactionRepository } from '../database/repository/stock-transaction-repository.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { Logger } from '../core/logger.js';
import { Holding } from '../database/models/holding.js';
import { stockLatestTradingPriceScheduler } from '../singleton.js';

const logger: Logger = new Logger('StockTransactionListener');

export class StockTransactionListener implements IEventListener {
    listen(eventName: string): void {
        logger.info(`Stock listener started for ${eventName}`);
        eventEmitter.once(eventName, async (args: { account: DematAccount; data: { [key: string]: string }[] }) => {
            logger.info(`Processing ended for ${(args.account as DematAccount).account_name}`);

            let dematAccount: DematAccount = args.account;
            let allStockData: { [key: string]: string }[] = ArrayUtil.sort(
                args.data,
                (item) => parse(item['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date()),
                true
            );

            for (let parseData of allStockData) {
                await this.processStockData(parseData, dematAccount);
            }

            let stocks = await stockTransactionRepository.find({});
            logger.info(`Data Stored Count ${stocks.length}`);
            dematAccount.last_synced_on = new Date();
            await dematAccountRepository.update(dematAccount.account_bo_id, dematAccount);

            // Sync the latest price of all stocks
            stockLatestTradingPriceScheduler.sync();
        });
    }

    refresh(eventName: string): void {
        eventEmitter.removeAllListeners(eventName);
        logger.info(`Stock listener stopped for ${eventName}`);
        this.listen(eventName);
    }

    private async processStockData(parseData: { [key: string]: string }, dematAccount: DematAccount) {
        const exchange = parseData['order_no'].length === 16 ? 'NSE' : 'BSE';
        const stockInfo = ALL_STOCKS.find(
            (value) => value.EXCHANGE === exchange && value.ISIN_NUMBER === parseData['stock_isin'].trim()
        );

        if (!stockInfo) return;

        const holdingId = `${stockInfo.SYMBOL}_${dematAccount.account_bo_id}`;
        logger.debug(
            `${holdingId} - ${parseData['transaction_date']} - ${parseData['stock_quantity']} - ${parseData['amount']}`
        );

        let holding = await holdingRepository.findOne({ where: { holding_id: holdingId } });
        if (!holding) {
            holding = await holdingRepository.save({
                holding_id: holdingId,
                stock_name: stockInfo.NAME_OF_COMPANY || '',
                stock_symbol_code: stockInfo.SYMBOL_CODE || '',
                stock_symbol: stockInfo.SYMBOL || '',
                stock_exchange: JSON.stringify({ [exchange]: true }),
                stock_isin: parseData['stock_isin'],
                current_price: 0,
                invested_amount: 0,
                total_shares: 0,
                account_id: dematAccount.account_bo_id
            });
        }
        if (!holding) return;
        await this.updateHoldingAndSaveTransaction(holding, parseData, dematAccount, exchange);
    }

    private async updateHoldingAndSaveTransaction(
        holding: Holding,
        parseData: {
            [key: string]: string;
        },
        dematAccount: DematAccount,
        exchange: string
    ) {
        let exchanges = JSON.parse(holding.stock_exchange);
        exchanges[exchange] = true;
        console.log(holding);
        holding.total_shares = holding.total_shares + Number.parseFloat(parseData['stock_quantity']);
        holding.invested_amount = holding.total_shares
            ? holding.invested_amount + -1 * Number.parseFloat(parseData['amount'])
            : 0;

        holding.stock_exchange = JSON.stringify(exchanges);
        await holdingRepository.update(holding.holding_id, holding);

        const stock: StockTransaction = {
            transaction_id: randomUUID(),
            holding_id: holding.holding_id,
            demat_account_id: dematAccount.account_bo_id,
            holding: holding,
            demat_account: dematAccount,
            transaction_date: parse(parseData['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date()),
            transaction_type: parseData['transaction_type'],
            stock_quantity: Math.abs(Number.parseFloat(parseData['stock_quantity'])),
            stock_transaction_price: Math.abs(Number.parseFloat(parseData['stock_transaction_price'])),
            amount: holding.invested_amount,
            dated: parse(parseData['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date())
        };

        await stockTransactionRepository.save(stock);
    }
}
