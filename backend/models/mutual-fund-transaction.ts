import { parse } from 'date-fns';

export class MutualFundTransaction {
    transactionId: string;
    fundName: string;
    portfolioNumber: string;
    transactionDate: Date;
    description: string;
    amount: number;
    isCredit: boolean;
    nav: number;
    units: number;
    latestNav: number;

    constructor(transactionId: string, portfolioNumber: string, fundName: string, transactionDate: Date, description: string, amount: number, nav: number, units: number, latestNav: number) {
        this.transactionId = transactionId;
        this.fundName = fundName;
        this.portfolioNumber = portfolioNumber;
        this.transactionDate = transactionDate;
        this.description = description;
        this.amount = amount;
        this.isCredit = this.amount > 0;
        this.units = units;
        this.nav = nav;
        this.latestNav = latestNav;
    }

    [Symbol.iterator]() {
        let array = [this.fundName, this.portfolioNumber, this.transactionDate, this.description, this.amount, this.isCredit, this.nav, this.units, this.latestNav];
        let i = 0;
        return {
            next: function () {
                return { value: array[i++], done: i == array.length };
            }
        };
    }
}

export interface IMutualFundTransaction {
    transaction_id: string;
    fundName: string;
    portfolio_number: string;
    transaction_date: string;
    description: string;
    amount: number;
    is_credit: boolean;
    nav: number;
    units: number;
    latest_nav: number;
}

export class MutualFundTransactionBuilder {
    static build = (item: { [key: string]: any }) => {
        return new MutualFundTransaction(
            item.transactionId,
            item.portfolioNumber,
            item.fundName,
            parse(item.transactionDate, 'dd-MMM-yyyy', new Date(), {
                weekStartsOn: 0
            }),
            item.description,
            item.amount,
            item.nav,
            item.units,
            item.latestNav
        );
    };

    static buildFromEntity = (item: { [key: string]: any }) => {
        return new MutualFundTransaction(
            item.transaction_id,
            item.portfolio_number,
            item.fund_name,
            new Date(item.transaction_date),
            item.description,
            item.amount,
            item.nav,
            item.units,
            item.latest_nav
        );
    };
}
