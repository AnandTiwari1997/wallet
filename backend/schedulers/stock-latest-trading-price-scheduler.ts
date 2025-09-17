import fetch from 'node-fetch';
import { IScheduler } from './scheduler.js';
import { Holding } from '../database/models/holding.js';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { Logger } from '../core/logger.js';

// Logger for this scheduler
const logger: Logger = new Logger('StockLatestTradingPriceScheduler');

/**
 * @class StockLatestTradingPriceScheduler
 * @description Scheduler to periodically update the latest trading price of stocks in holdings.
 * @implements {IScheduler<Holding>}
 */
export class StockLatestTradingPriceScheduler implements IScheduler<Holding> {
    /**
     * @method schedule
     * @description Schedules the sync process to run at a specified interval.
     * @param intervalInMS
     */
    schedule(intervalInMS: number = 1000 * 60 * 5): void {
        this.sync();
        setInterval(this.sync.bind(this), intervalInMS);
    }

    /**
     * @private
     * @method fetchLatestStockPrice
     * @description Fetches the latest stock price from the Groww API.
     * @param {string} exchange - The stock exchange (e.g., 'NSE', 'BSE').
     * @param {string} [symbolCode] - The symbol code of the stock.
     * @returns {Promise<number>} The latest stock price, or 0 if an error occurs.
     */
    private async fetchLatestStockPrice(exchange: string, symbolCode?: string): Promise<number> {
        if (!symbolCode) return 0;
        let url: string = `https://www.groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/${exchange}/segment/CASH/${symbolCode}/latest`;
        try {
            let response = await fetch(url);
            if (response.ok) {
                let data: any = await response.json();
                return Number.parseFloat(data['ltp']);
            }
        } catch (e) {
            logger.error(e);
        }
        return 0;
    }

    /**
     * @private
     * @method sync
     * @description Syncs the latest trading price for all holdings.
     */
    private sync(): void {
        logger.info(`Stock LTP Sync Started`);
        holdingRepository.find({}).then((holdings) => {
            holdings.forEach(async (holding) => {
                let currentPrice = holding.current_price;
                let exchange = holding.stock_exchange;
                currentPrice = await this.fetchLatestStockPrice(exchange, holding.stock_symbol_code);
                if (holding.current_price === currentPrice) return;
                logger.debug(`Updated price of ${holding.stock_name} to ${currentPrice}`);
                await holdingRepository.update(holding.holding_id, {
                    holding_id: holding.holding_id,
                    stock_name: holding.stock_name,
                    stock_symbol_code: holding.stock_symbol_code,
                    stock_symbol: holding.stock_symbol,
                    stock_exchange: holding.stock_exchange,
                    stock_isin: holding.stock_isin,
                    current_price: currentPrice,
                    total_shares: holding.total_shares,
                    invested_amount: holding.invested_amount,
                    account_id: holding.account_id
                });
            });
        });
    }
}
