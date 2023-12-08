import { Holding } from './holding.js';
import { DematAccount } from './demat-account.js';

export interface StockTransaction {
    transaction_id: string;
    holding: Holding;
    demat_account: DematAccount;
    transaction_date: Date;
    transaction_type: string;
    stock_quantity: number;
    stock_transaction_price: number;
    amount: number;
    dated: Date;
}

export interface StockTransactionDto {
    transaction_id: string;
    holding: Holding;
    demat_account: DematAccount;
    transaction_date: string;
    transaction_type: string;
    stock_quantity: number;
    stock_transaction_price: number;
    amount: number;
    dated: string;
}

export class StockTransactionBuilder {
    static buildFromEntity(iStock: StockTransaction & Holding & DematAccount): StockTransaction {
        return {
            transaction_id: iStock.transaction_id,
            holding: {
                holding_id: iStock.holding_id,
                stock_isin: iStock.stock_isin,
                stock_exchange: iStock.stock_exchange,
                stock_symbol: iStock.stock_symbol,
                current_price: iStock.current_price,
                stock_name: iStock.stock_name,
                stock_symbol_code: iStock.stock_symbol_code,
                invested_amount: iStock.invested_amount,
                total_shares: iStock.total_shares,
                account_id: iStock.account_id
            },
            demat_account: {
                account_bo_id: iStock.account_bo_id,
                account_client_id: iStock.account_client_id,
                account_name: iStock.account_name,
                broker: iStock.broker,
                account_type: iStock.account_type,
                start_date: iStock.start_date,
                last_synced_on: iStock.last_synced_on
            },
            transaction_date: new Date(iStock.transaction_date),
            transaction_type: iStock.transaction_type,
            stock_quantity: iStock.stock_quantity,
            stock_transaction_price: iStock.stock_transaction_price,
            amount: iStock.amount,
            dated: new Date(iStock.dated)
        };
    }

    static toStockTransactionDto(item: StockTransaction): StockTransactionDto {
        return {
            transaction_id: item.transaction_id,
            holding: item.holding,
            demat_account: item.demat_account,
            transaction_date: item.transaction_date.toISOString(),
            transaction_type: item.transaction_type,
            stock_quantity: item.stock_quantity,
            stock_transaction_price: item.stock_transaction_price,
            amount: item.amount,
            dated: item.dated.toISOString()
        };
    }

    static toStockTransaction(item: StockTransactionDto): StockTransaction {
        return {
            transaction_id: item.transaction_id,
            holding: item.holding,
            demat_account: item.demat_account,
            transaction_date: new Date(item.transaction_date),
            transaction_type: item.transaction_type,
            stock_quantity: item.stock_quantity,
            stock_transaction_price: item.stock_transaction_price,
            amount: item.amount,
            dated: new Date(item.dated)
        };
    }
}
