import { parse } from 'date-fns';

export class TransactionType {
    static INCOME = { label: 'Income', value: 'INCOME' };
    static EXPENSE = { label: 'Expense', value: 'EXPENSE' };

    static get() {
        return [TransactionType.INCOME, TransactionType.EXPENSE];
    }
}

export class PaymentMode {
    static CASH = { label: 'Cash', value: 'CASH' };
    static BANK_TRANSFER = { label: 'Bank Transfer', value: 'BANK_TRANSFER' };
    static MOBILE_TRANSFER = { label: 'Mobile Transfer', value: 'MOBILE_TRANSFER' };
    static CHEQUE = { label: 'Cheque', value: 'CHEQUE' };

    static get() {
        return [PaymentMode.CASH, PaymentMode.BANK_TRANSFER, PaymentMode.MOBILE_TRANSFER, PaymentMode.CHEQUE];
    }
}

export class TransactionStatus {
    static COMPLETED = { label: 'Completed', value: 'COMPLETED' };
    static PENDING = { label: 'Pending', value: 'PENDING' };

    static get() {
        return [TransactionStatus.COMPLETED, TransactionStatus.PENDING];
    }
}

export class Category {
    static SALARY = { label: 'Salary', value: 'SALARY' };
    static FOOD = { label: 'Food', value: 'FOOD' };
    static FUEL = { label: 'Fuel', value: 'FUEL' };
    static PHONE_RECHARGE = { label: 'Phone Recharge', value: 'PHONE_RECHARGE' };
    static BROADBAND_RECHARGE = { label: 'Broadband Recharge', value: 'BROADBAND_RECHARGE' };
    static DIVIDEND = { label: 'Dividend', value: 'DIVIDEND' };
    static INTEREST_RECEIVED = { label: 'Interest Received', value: 'INTEREST_RECEIVED' };
    static OTHERS = { label: 'Others', value: 'OTHERS' };

    static get() {
        return [Category.SALARY, Category.INTEREST_RECEIVED, Category.DIVIDEND, Category.FUEL, Category.FOOD, Category.BROADBAND_RECHARGE, Category.PHONE_RECHARGE, Category.OTHERS];
    }
}

export class ProvidentFundTransaction {
    transactionId: string;
    wageMonth: string;
    transactionDate: Date;
    description: string;
    epfAmount: number;
    epsAmount: number;
    employeeContribution: number;
    employerContribution: number;
    pensionAmount: number;
    isCredit: boolean;
    financialYear: string;

    constructor(
        transactionId: string,
        wageMonth: string,
        transactionDate: Date,
        description: string,
        transactionType: string,
        epfAmount: number,
        epsAmount: number,
        employeeContribution: number,
        employerContribution: number,
        pensionAmount: number,
        financialYear: string
    ) {
        this.transactionId = transactionId;
        this.wageMonth = wageMonth;
        this.transactionDate = transactionDate;
        this.description = description;
        this.epfAmount = epfAmount;
        this.isCredit = transactionType === 'CR';
        this.epsAmount = epsAmount;
        this.employeeContribution = employeeContribution;
        this.employerContribution = employerContribution;
        this.pensionAmount = pensionAmount;
        this.financialYear = financialYear;
    }

    static parseDate = (strDate: string) => {
        return parse(strDate, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date(), {
            weekStartsOn: 0
        });
    };

    static build = (item: any) => {
        const date = ProvidentFundTransaction.parseDate(item.transactionDate);
        return new ProvidentFundTransaction(
            item.transactionId,
            item.wageMonth,
            date,
            item.description,
            item.transactionType,
            item.epfAmount,
            item.epsAmount,
            item.employeeContribution,
            item.employerContribution,
            item.pensionAmount,
            item.financialYear
        );
    };
}

export class MutualFundTransaction {
    transactionId: string;
    fundName: string;
    portfolioNumber: string;
    transactionDate: Date;
    amount: number;
    isCredit: boolean;
    nav: number;
    units: number;
    latestNav: number;

    constructor(portfolioNumber: string, fundName: string, transactionDate: Date, transactionId: string, amount: number, nav: number, units: number, latestNav: number) {
        this.transactionId = transactionId;
        this.fundName = fundName;
        this.portfolioNumber = portfolioNumber;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.isCredit = this.amount > 0;
        this.units = units;
        this.nav = nav;
        this.latestNav = latestNav;
    }

    static build = (item: any) => {
        const date = new Date(item.transactionDate);
        return new MutualFundTransaction(item.portfolioNumber, item.fundName, date, item.transactionId, item.amount, item.nav, item.units, item.latestNav);
    };

    static parseDate = (strDate: string) => {
        return parse(strDate, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date(), {
            weekStartsOn: 0
        });
    };
}

export class ArrayUtil {
    static groupBy<T>(arr: T[], fn: (item: T) => string): { [key: string]: T[] } {
        return arr.reduce<Record<string, T[]>>((prev, curr) => {
            const groupKey = fn(curr);
            const group = prev[groupKey] || [];
            group.push(curr);
            return { ...prev, [groupKey]: group };
        }, {});
    }

    static map<T, U>(arr: T[], fn: (item: T) => U): U[] {
        return arr.map(fn);
    }

    static sum<T>(arr: T[], fn: (item: T) => number): number {
        return arr.reduce((previousSum: number, currentItem: T) => {
            previousSum += fn(currentItem);
            return previousSum;
        }, 0);
    }

    static sort<T>(arr: T[], fn: (item: T) => any): T[] {
        return arr.sort((a: T, b: T) => {
            if (fn(a) > fn(b)) return -1;
            if (fn(a) < fn(b)) return 1;
            return 0;
        });
    }
}
