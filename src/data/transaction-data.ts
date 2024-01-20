import { parse } from 'date-fns';

export class TransactionType {
    static INCOME = { label: 'Income', value: 'INCOME' };
    static EXPENSE = { label: 'Expense', value: 'EXPENSE' };

    static typeMap: { [key: string]: { label: string; value: string } } = {
        INCOME: TransactionType.INCOME,
        EXPENSE: TransactionType.EXPENSE
    };

    static getLabel(value: string) {
        return TransactionType.typeMap[value.toUpperCase()].label;
    }

    static get() {
        return [TransactionType.INCOME, TransactionType.EXPENSE];
    }
}

export class PaymentMode {
    static CASH = { label: 'Cash', value: 'CASH' };
    static BANK_TRANSFER = { label: 'Bank Transfer', value: 'BANK_TRANSFER' };
    static MOBILE_TRANSFER = { label: 'Mobile Transfer', value: 'MOBILE_TRANSFER' };
    static CHEQUE = { label: 'Cheque', value: 'CHEQUE' };
    static ATM = { label: 'ATM', value: 'ATM' };

    static paymentModeMap: { [key: string]: { label: string; value: string } } = {
        CASH: PaymentMode.CASH,
        BANK_TRANSFER: PaymentMode.BANK_TRANSFER,
        MOBILE_TRANSFER: PaymentMode.MOBILE_TRANSFER,
        CHEQUE: PaymentMode.CHEQUE,
        ATM: PaymentMode.ATM
    };

    static getLabel(value: string) {
        return PaymentMode.paymentModeMap[value.toUpperCase()].label;
    }

    static get() {
        return [PaymentMode.CASH, PaymentMode.BANK_TRANSFER, PaymentMode.MOBILE_TRANSFER, PaymentMode.CHEQUE];
    }
}

export class TransactionStatus {
    static COMPLETED = { label: 'Completed', value: 'COMPLETED' };
    static PENDING = { label: 'Pending', value: 'PENDING' };

    static statusMap: { [key: string]: { label: string; value: string } } = {
        COMPLETED: TransactionStatus.COMPLETED,
        PENDING: TransactionStatus.PENDING
    };

    static getLabel(value: string) {
        return TransactionStatus.statusMap[value.toUpperCase()].label;
    }

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
    static DTH_RECHARGE = { label: 'DTH Recharge', value: 'DTH_RECHARGE' };
    static DIVIDEND = { label: 'Dividend', value: 'DIVIDEND' };
    static INTEREST_RECEIVED = { label: 'Interest Received', value: 'INTEREST_RECEIVED' };
    static OTHERS = { label: 'Others', value: 'OTHER' };
    static INVESTMENT = { label: 'Investment', value: 'INVESTMENT' };
    static SUBSCRIPTION = { label: 'Subscription', value: 'SUBSCRIPTION' };
    static RENT = { label: 'Rent', value: 'RENT' };
    static GROCERY = { label: 'Grocery', value: 'GROCERY' };
    static EMI = { label: 'EMI', value: 'EMI' };
    static DAIRY_PRODUCT = { label: 'Dairy Product', value: 'DAIRY_PRODUCT' };
    static HOUSE_CHORES = { label: 'House Chores', value: 'HOUSE_CHORES' };
    static SHOPPING = { label: 'Shopping', value: 'SHOPPING' };
    static TICKETS = { label: 'Ticket', value: 'TICKETS' };
    static REFUND = { label: 'Refund', value: 'REFUND' };
    static SCHOOL_FEE = { label: 'School Fee', value: 'SCHOOL_FEE' };
    static ATM_DEPOSIT = { label: 'ATM Deposit', value: 'ATM_DEPOSIT' };
    static ATM_WITHDRAWAL = { label: 'ATM Withdrawal', value: 'ATM_WITHDRAWAL' };
    static SENT_SELF = { label: 'Sent to Self', value: 'SENT_SELF' };
    static RECEIVED_SELF = { label: 'Received from Self', value: 'RECEIVED_SELF' };

    static categoryMap: { [key: string]: { label: string; value: string } } = {
        SALARY: Category.SALARY,
        FOOD: Category.FOOD,
        FUEL: Category.FUEL,
        PHONE_RECHARGE: Category.PHONE_RECHARGE,
        BROADBAND_RECHARGE: Category.BROADBAND_RECHARGE,
        DTH_RECHARGE: Category.DTH_RECHARGE,
        DIVIDEND: Category.DIVIDEND,
        INTEREST_RECEIVED: Category.INTEREST_RECEIVED,
        OTHER: Category.OTHERS,
        INVESTMENT: Category.INVESTMENT,
        SUBSCRIPTION: Category.SUBSCRIPTION,
        RENT: Category.RENT,
        GROCERY: Category.GROCERY,
        EMI: Category.EMI,
        DAIRY_PRODUCT: Category.DAIRY_PRODUCT,
        HOUSE_CHORES: Category.HOUSE_CHORES,
        SHOPPING: Category.SHOPPING,
        TICKETS: Category.TICKETS,
        REFUND: Category.REFUND,
        SCHOOL_FEE: Category.SCHOOL_FEE,
        ATM_DEPOSIT: Category.ATM_DEPOSIT,
        ATM_WITHDRAWAL: Category.ATM_WITHDRAWAL,
        SENT_SELF: Category.SENT_SELF,
        RECEIVED_SELF: Category.RECEIVED_SELF
    };

    static getLabel(value: string) {
        return Category.categoryMap[value.toUpperCase()].label;
    }

    static get() {
        return [
            Category.SALARY,
            Category.SHOPPING,
            Category.INTEREST_RECEIVED,
            Category.RENT,
            Category.SUBSCRIPTION,
            Category.INVESTMENT,
            Category.GROCERY,
            Category.DIVIDEND,
            Category.FUEL,
            Category.FOOD,
            Category.BROADBAND_RECHARGE,
            Category.PHONE_RECHARGE,
            Category.DTH_RECHARGE,
            Category.EMI,
            Category.DAIRY_PRODUCT,
            Category.HOUSE_CHORES,
            Category.TICKETS,
            Category.REFUND,
            Category.ATM_DEPOSIT,
            Category.ATM_WITHDRAWAL,
            Category.SCHOOL_FEE,
            Category.SENT_SELF,
            Category.RECEIVED_SELF,
            Category.OTHERS
        ];
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

    static freq<T, U>(arr: T[], fn: (previousValue: U[], currentValue: T) => U[]): U[] {
        return arr.reduce<U[]>((previousValue: U[], currentValue: T) => {
            return fn(previousValue, currentValue);
        }, []);
    }

    static max<T>(arr: T[], fn: (item: T) => any): T {
        return ArrayUtil.sort(arr, fn)[0];
    }
}
