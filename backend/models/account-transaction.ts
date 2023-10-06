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
    static OTHER = 'Other';
}

export class Transaction {
    transactionId: string;
    account: number;
    transactionDate: Date;
    amount: number;
    category: Category;
    labels?: string[] = [];
    note?: string = '';
    currency?: string = 'INR';
    paymentMode?: PaymentMode = PaymentMode.CASH;
    transactionType: TransactionType;
    transactionState?: TransactionStatus = TransactionStatus.COMPLETED;

    constructor(transactionId: string, account: number, transactionDate: string, amount: number, category: string, transactionType: string) {
        this.transactionId = transactionId;
        this.account = account;
        this.transactionDate = new Date(transactionDate);
        this.amount = amount;
        this.category = category;
        this.transactionType = transactionType;
    }

    /**
     * name
     */
    public isExpense() {
        return this.transactionType === TransactionType.EXPENSE;
    }

    [Symbol.iterator]() {
        let array = [this.transactionId, this.transactionDate, this.amount, this.account, this.transactionType, this.currency, this.category, this.paymentMode, this.note, this.labels];
        let i = 0;
        return {
            next: function () {
                return { value: array[i++], done: i == array.length };
            }
        };
    }
}

export class TransactionBuilder {
    static build = (item: { [key: string]: any }) => {
        let transaction = new Transaction(item.transactionId, item.account, item.transactionDate, item.amount, item.category, item.transactionType);
        transaction.labels = item.labels;
        transaction.note = item.note;
        transaction.currency = item.currency;
        transaction.paymentMode = item.paymentMode;
        transaction.transactionState = item.transactionState;
        return transaction;
    };
}
