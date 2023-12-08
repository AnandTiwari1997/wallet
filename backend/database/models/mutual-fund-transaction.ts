import { parse } from 'date-fns';

export interface MutualFundTransaction {
    transaction_id: string;
    fund_name: string;
    portfolio_number: string;
    transaction_date: Date;
    description: string;
    amount: number;
    is_credit: boolean;
    nav: number;
    units: number;
    latest_nav: number;
    isin: string;
}

export interface IMutualFundTransaction {
    transaction_id: string;
    fund_name: string;
    portfolio_number: string;
    transaction_date: string;
    description: string;
    amount: number;
    is_credit: boolean;
    nav: number;
    units: number;
    latest_nav: number;
    isin: string;
}

export class MutualFundTransactionBuilder {
    static build = (item: { [key: string]: any }): MutualFundTransaction => {
        return {
            transaction_id: item.transactionId,
            portfolio_number: item.portfolioNumber,
            fund_name: item.fundName,
            transaction_date: parse(item.transactionDate, 'dd-MMM-yyyy', new Date(), {
                weekStartsOn: 0
            }),
            description: item.description,
            amount: item.amount,
            nav: item.nav,
            units: item.units,
            latest_nav: item.latestNav,
            is_credit: item.amount > 0,
            isin: item.isin
        };
    };

    static buildFromEntity = (item: IMutualFundTransaction): MutualFundTransaction => {
        return {
            transaction_id: item.transaction_id,
            portfolio_number: item.portfolio_number,
            fund_name: item.fund_name,
            transaction_date: new Date(item.transaction_date),
            description: item.description,
            amount: item.amount,
            nav: item.nav,
            units: item.units,
            latest_nav: item.latest_nav,
            is_credit: item.is_credit,
            isin: item.isin
        };
    };
}
