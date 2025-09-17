/**
 * @file This file contains the StockTransactionListener class, which is responsible for listening to and processing stock transaction events.
 */
import { IEventListener } from './event-listener.js';
import { eventEmitter } from '../server.js';
import { DematAccount } from '../database/models/demat-account.js';
import { parse } from 'date-fns';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { StockTransaction } from '../database/models/stock-transaction.js';
import { randomUUID } from 'crypto';
import { stockTransactionRepository } from '../database/repository/stock-transaction-repository.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { Logger } from '../core/logger.js';
import { Holding } from '../database/models/holding.js';
import { ALL_STOCKS } from '../utils/stocks.js';
import { ArrayUtil } from '../utils/array-util.js';

const logger: Logger = new Logger('StockTransactionListener');

/**
 * @interface RawStockTransactionData
 * @description Represents the raw data structure of a stock transaction.
 */
interface RawStockTransactionData {
    order_no: string;
    stock_isin: string;
    transaction_date: string;
    stock_quantity: string;
    amount: string;
    transaction_type: string;
    stock_transaction_price: string;
}

/**
 * @class StockTransactionListener
 * @description Implements the IEventListener interface to handle stock transaction events.
 * This class processes raw stock transaction data, updates holdings, and stores transaction records.
 */
export class StockTransactionListener implements IEventListener {
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
     * @method findOrCreateHolding
     * @description Finds an existing holding or creates a new one if it doesn't exist.
     * @param {string} holdingId - The unique ID of the holding.
     * @param {{ [key: string]: string }} stockInfo - Information about the stock.
     * @param {string} exchange - The stock exchange.
     * @param {string} stockISIN - The ISIN of the stock.
     * @param {DematAccount} dematAccount - The demat account associated with the holding.
     * @returns {Promise<Holding | null>} The found or created holding, or null if an error occurs.
     */
    private async findOrCreateHolding(
        holdingId: string,
        stockInfo: { [key: string]: string },
        exchange: string,
        stockISIN: string,
        dematAccount: DematAccount
    ): Promise<Holding | null> {
        let holding = await holdingRepository.findOne({
            where: {
                holding_id: holdingId,
                stock_exchange: exchange
            }
        });
        if (!holding || holding.current_price === 0) {
            let currentPrice = await this.fetchLatestStockPrice(exchange, stockInfo.SYMBOL_CODE);
            let amountPerAccount: number = 0;
            let sharesPerAccount: number = 0;
            if (holding) {
                amountPerAccount = Number.parseFloat(holding.invested_amount.toString(2));
                sharesPerAccount = Number.parseFloat(holding.total_shares.toString(2));
            }
            holding = await holdingRepository.save({
                holding_id: holdingId,
                stock_name: stockInfo.NAME_OF_COMPANY || '',
                stock_symbol_code: stockInfo.SYMBOL_CODE || '',
                stock_symbol: stockInfo.SYMBOL || '',
                stock_exchange: exchange,
                stock_isin: stockISIN,
                current_price: currentPrice,
                invested_amount: amountPerAccount,
                total_shares: sharesPerAccount,
                account_id: dematAccount.account_bo_id
            });
        }
        return holding;
    }

    /**
     * @private
     * @method updateHoldingDetails
     * @description Updates the total shares and invested amount of a holding.
     * @param {Holding} holding - The holding to update.
     * @param {string} stockQuantity - The quantity of the stock transaction.
     * @param {string} transactionAmount - The amount of the transaction.
     */
    private updateHoldingDetails(holding: Holding, stockQuantity: string, transactionAmount: string) {
        holding.total_shares += Number.parseFloat(stockQuantity);
        if (holding.total_shares === 0) {
            holding.invested_amount = 0;
        } else {
            holding.invested_amount -= Number.parseFloat(transactionAmount);
        }
    }

    /**
     * @private
     * @method handleSingleTransactionData
     * @description Handles a single raw stock transaction data object.
     * @param {RawStockTransactionData} parseData - The raw transaction data.
     * @param {DematAccount} dematAccount - The demat account for the transaction.
     * @returns {Promise<void>}
     */
    private async handleSingleTransactionData(
        parseData: RawStockTransactionData,
        dematAccount: DematAccount
    ): Promise<void> {
        let exchange = parseData.order_no.length == 16 ? 'NSE' : 'BSE';
        const stockInfo = ALL_STOCKS.find(
            (value) => value.EXCHANGE === exchange && value.ISIN_NUMBER === parseData.stock_isin.trim()
        );
        if (!stockInfo) return;
        let holdingId = stockInfo.SYMBOL + '_' + dematAccount.account_bo_id;
        logger.debug(
            `${holdingId} - ${parseData.transaction_date} - ${parseData.stock_quantity} - ${parseData.amount}`
        );
        let holding = await this.findOrCreateHolding(
            holdingId,
            stockInfo,
            exchange,
            parseData.stock_isin,
            dematAccount
        );
        if (!holding) return;
        this.updateHoldingDetails(holding, parseData.stock_quantity, parseData.amount);
        const stock: StockTransaction = {
            transaction_id: randomUUID(),
            holding_id: holding.holding_id,
            demat_account_id: dematAccount.account_bo_id,
            holding: holding,
            demat_account: dematAccount,
            transaction_date: parse(parseData.transaction_date, 'dd-MMM-yyyy HH:mm:ss', new Date()),
            transaction_type: parseData.transaction_type,
            stock_quantity: Math.abs(Number.parseFloat(parseData.stock_quantity)),
            stock_transaction_price: Math.abs(Number.parseFloat(parseData.stock_transaction_price)),
            amount: holding.invested_amount,
            dated: parse(parseData.transaction_date, 'dd-MMM-yyyy HH:mm:ss', new Date())
        };
        await stockTransactionRepository.save(stock);
        await holdingRepository.update(holding.holding_id, holding);
    }

    /**
     * @method listen
     * @description Listens for a specific event and processes the data associated with it.
     * @param {string} eventName - The name of the event to listen for.
     */
    listen(eventName: string): void {
        eventEmitter.on(eventName, async (args: { account: DematAccount; data: RawStockTransactionData[] }) => {
            logger.info(`Processing stock transaction for ${(args.account as DematAccount).account_name}`);
            let dematAccount: DematAccount = args.account;
            let allStockData = ArrayUtil.sort(
                args.data,
                (item) => parse(item.transaction_date, 'dd-MMM-yyyy HH:mm:ss', new Date()),
                true
            );
            for (let parseData of allStockData) {
                await this.handleSingleTransactionData(parseData, dematAccount);
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
