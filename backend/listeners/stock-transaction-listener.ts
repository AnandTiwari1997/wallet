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

const logger: Logger = new Logger('StockTransactionListener');

export class StockTransactionListener implements IEventListener {
    listen(eventName: string): void {
        eventEmitter.once(eventName, async (args: { account: DematAccount; data: { [key: string]: string }[] }) => {
            logger.info(`Processing ended for ${(args.account as DematAccount).account_name}`);
            let dematAccount: DematAccount = args.account;
            let allStockData = ArrayUtil.sort(
                args.data,
                (item) => parse(item['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date()),
                true
            );
            for (let parseData of allStockData) {
                let exchange = parseData['order_no'].length == 16 ? 'NSE' : 'BSE';
                const stockInfo = ALL_STOCKS.find(
                    (value) => value.EXCHANGE === exchange && value.ISIN_NUMBER === parseData['stock_isin'].trim()
                );
                if (!stockInfo) continue;
                let holdingId = stockInfo.SYMBOL + '_' + dematAccount.account_bo_id;
                logger.debug(
                    `${holdingId} - ${parseData['transaction_date']} - ${parseData['stock_quantity']} - ${parseData['amount']}`
                );
                let holding = await holdingRepository.findOne({
                    where: {
                        holding_id: holdingId
                    }
                });
                if (!holding || holding.current_price === 0) {
                    let url: string = `https://www.groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/${exchange}/segment/CASH/${
                        stockInfo?.SYMBOL_CODE || ''
                    }/latest`;
                    let currentPrice = 0;
                    try {
                        let response = await fetch(url);
                        if (response) {
                            let data: any = await response.json();
                            currentPrice = Number.parseFloat(data['ltp']);
                        }
                    } catch (e) {
                        logger.error(e);
                    }
                    let amountPerAccount: number = 0;
                    let sharesPerAccount: number = 0;
                    let exchanges: {
                        [key: string]: boolean;
                    } = {};
                    if (holding) {
                        amountPerAccount = Number.parseFloat(holding.invested_amount.toString(2));
                        sharesPerAccount = Number.parseFloat(holding.total_shares.toString(2));
                        exchanges = JSON.parse(holding.stock_exchange);
                    } else {
                        amountPerAccount = 0;
                        sharesPerAccount = 0;
                        exchanges[exchange] = true;
                    }
                    holding = await holdingRepository.save({
                        holding_id: holdingId,
                        stock_name: stockInfo.NAME_OF_COMPANY || '',
                        stock_symbol_code: stockInfo.SYMBOL_CODE || '',
                        stock_symbol: stockInfo.SYMBOL || '',
                        stock_exchange: JSON.stringify(exchanges),
                        stock_isin: parseData['stock_isin'],
                        current_price: currentPrice,
                        invested_amount: amountPerAccount,
                        total_shares: sharesPerAccount,
                        account_id: dematAccount.account_bo_id
                    });
                }
                if (!holding) return;
                let exchanges = JSON.parse(holding.stock_exchange);
                exchanges[exchange] = true;
                holding.total_shares =
                    Number.parseFloat(holding.total_shares.toString(2)) +
                    Number.parseFloat(parseData['stock_quantity']);
                if (holding.total_shares === 0) {
                    holding.invested_amount = 0;
                } else {
                    holding.invested_amount =
                        Number.parseFloat(holding.invested_amount.toString(2)) +
                        -1 * Number.parseFloat(parseData['amount']);
                }
                holding.stock_exchange = JSON.stringify(exchanges);
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
                await holdingRepository.update(holding.holding_id, holding);
            }
            let stocks = await stockTransactionRepository.find({});
            logger.info(`Data Stored Count ${stocks.length}`);
            dematAccount.last_synced_on = new Date();
            await dematAccountRepository.update(dematAccount.account_bo_id, dematAccount);
        });
    }

    refresh(eventName: string): void {
        eventEmitter.removeAllListeners(eventName);
        this.listen(eventName);
    }
}
