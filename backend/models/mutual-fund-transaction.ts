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
    latest_nav: number;

    constructor(
        transactionId: string,
        portfolioNumber: string,
        fundName: string,
        transactionDate: string,
        description: string,
        amount: number,
        nav: number,
        units: number,
        latest_nav: number
    ) {
        this.transactionId = transactionId;
        this.fundName = fundName;
        this.portfolioNumber = portfolioNumber;
        this.transactionDate = parse(transactionDate, 'dd-MMM-yyyy', new Date(), {
            weekStartsOn: 0
        });
        this.description = description;
        this.amount = amount;
        this.isCredit = this.amount > 0;
        this.units = units;
        this.nav = nav;
        this.latest_nav = latest_nav;
    }

    [Symbol.iterator]() {
        let array = [
            this.fundName,
            this.portfolioNumber,
            this.transactionDate,
            this.description,
            this.amount,
            this.isCredit,
            this.nav,
            this.units,
            this.latest_nav
        ];
        let i = 0;
        return {
            next: function () {
                return { value: array[i++], done: i == array.length };
            }
        };
    }
}

export class MutualFundTransactionBuilder {
    static build = (item: { [key: string]: any }) => {
        return new MutualFundTransaction(
            item.transactionId,
            item.portfolioNumber,
            item.fundName,
            item.transactionDate,
            item.description,
            item.amount,
            item.nav,
            item.units,
            item.latest_nav
        );
    };
}
