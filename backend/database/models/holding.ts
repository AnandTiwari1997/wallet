export interface Holding {
    holding_id: string;
    stock_name: string;
    stock_symbol_code: string;
    stock_symbol: string;
    stock_exchange: string;
    stock_isin: string;
    total_shares: number;
    invested_amount: number;
    current_price: number;
    account_id: string;
}

export class HoldingBuilder {
    static buildFromEntity(item: Holding): Holding {
        return {
            holding_id: item.holding_id,
            stock_name: item.stock_name,
            stock_symbol_code: item.stock_symbol_code,
            stock_symbol: item.stock_symbol,
            stock_exchange: item.stock_exchange,
            stock_isin: item.stock_isin,
            total_shares: item.total_shares,
            invested_amount: item.invested_amount,
            current_price: item.current_price,
            account_id: item.account_id
        };
    }
}
