import { SyncProvider } from './sync-provider.js';
import { Holding } from '../../database/models/holding.js';
import fetch from 'node-fetch';
import { holdingRepository } from '../../database/repository/holding-repository.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('StockLatestTradingPriceSyncProvider');

class StockLatestTradingPriceSyncProvider implements SyncProvider<Holding> {
    manualSync(accounts: Holding[], deltaSync: boolean): void {
        accounts.forEach(async (holding) => {
            let currentPrice = holding.current_price;
            let exchanges = JSON.parse(holding.stock_exchange);
            let price = 0;
            for (let key in exchanges) {
                let url: string = `https://www.groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/${key}/segment/CASH/${holding.stock_symbol_code}/latest`;
                try {
                    let response = await fetch(url);
                    if (response) {
                        let data: any = await response.json();
                        price = Math.max(price, Number.parseFloat(data['ltp']));
                        currentPrice = price;
                    } else {
                        logger.debug(response);
                    }
                } catch (e) {
                    // logger.error(e);
                }
            }
            if (holding.current_price === currentPrice) return;
            logger.info(`Updated price of ${holding.stock_name} to ${currentPrice}`);
            await holdingRepository.update({
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
    }

    sync(): void {
        setInterval(
            () => {
                holdingRepository.findAll({}).then((holdings) => {
                    stockLatestTradingPriceSynProvider.manualSync(holdings, false);
                });
            },
            1000 * 60 * 5
        );
    }
}

export const stockLatestTradingPriceSynProvider = new StockLatestTradingPriceSyncProvider();
stockLatestTradingPriceSynProvider.sync();
