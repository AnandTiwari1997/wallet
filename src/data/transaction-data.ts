import { parse } from 'date-fns';

export class TransactionType {
    static INCOME = 'Income';
    static EXPENSE = 'Expense';
}

export class PaymentMode {
    static CASH = 'Cash';
    static BANK_TRANSFER = 'Bank Transfer';
    static MOBILE_TRANSFER = 'Mobile Transfer';
    static CHEQUE = 'Cheque';
}

export class TransactionStatus {
    static COMPLETED = 'Completed';
    static PENDING = 'Pending';
}

export class Category {
    static SALARY = 'Salary';
    static FOOD = 'Food';
    static FUEL = 'Fuel';
    static PHONE_RECHARGE = 'Phone Recharge';
    static BROADBAND_RECHARGE = 'BroadBand Recharge';
    static DIVIDEND = 'Dividend';
    static INTEREST_RECEIVED = 'Interest Received';
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

    constructor(
        portfolioNumber: string,
        fundName: string,
        transactionDate: Date,
        transactionId: string,
        amount: number,
        nav: number,
        units: number,
        latestNav: number
    ) {
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

export class Transaction {
    transactionId: string;
    account: number;
    transactionDate: Date;
    amount: number;
    category: string;
    labels: string[];
    note: string;
    currency: string;
    paymentMode: PaymentMode;
    transactionType: TransactionType;
    transactionState: TransactionStatus;

    constructor(
        transactionId: string,
        account: number,
        transactionDate: Date,
        amount: number,
        category: string,
        labels: string[],
        note: string,
        currency: string,
        paymentMode: PaymentMode,
        transactionType: TransactionType,
        transactionState: TransactionStatus
    ) {
        this.transactionId = transactionId;
        this.account = account;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.category = category;
        this.labels = labels;
        this.note = note;
        this.currency = currency;
        this.paymentMode = paymentMode;
        this.transactionType = transactionType;
        this.transactionState = transactionState;
    }

    /**
     * name
     */
    public isExpense() {
        return this.transactionType === TransactionType.EXPENSE;
    }
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
