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
    transaction_id: string;
    account: number;
    transaction_date: Date;
    amount: number;
    category: Category;
    labels?: string[] = [];
    note?: string = '';
    currency?: string = 'INR';
    payment_mode?: PaymentMode = PaymentMode.CASH;
    transaction_type: TransactionType;
    transaction_state?: TransactionStatus = TransactionStatus.COMPLETED;

    constructor(transaction_id: string, account: number, transaction_date: Date, amount: number, category: string, transaction_type: string) {
        this.transaction_id = transaction_id;
        this.account = account;
        this.transaction_date = transaction_date;
        this.amount = amount;
        this.category = category;
        this.transaction_type = transaction_type;
    }

    /**
     * name
     */
    public isExpense() {
        return this.transaction_type === TransactionType.EXPENSE;
    }

    [Symbol.iterator]() {
        let array = [this.transaction_id, this.transaction_date.toISOString(), this.amount, this.account, this.transaction_type, this.currency, this.category, this.payment_mode, this.labels];
        let i = 0;
        return {
            next: function () {
                return { value: array[i++], done: i == array.length };
            }
        };
    }
}

export class TransactionDto {
    transactionId: string;
    account: number;
    transactionDate: Date;
    amount: number;
    category: Category;
    labels: string[] = [];
    note: string = '';
    currency: string = 'INR';
    paymentMode: PaymentMode = PaymentMode.CASH;
    transactionType: TransactionType;
    transactionState: TransactionStatus = TransactionStatus.COMPLETED;

    constructor(
        transactionId: string,
        account: number,
        transactionDate: Date,
        amount: number,
        category: Category,
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

export class TransactionBuilder {
    static build = (item: { [key: string]: any }) => {
        let transaction = new Transaction(item.transactionId, item.account, item.transactionDate, item.amount, item.category, item.transactionType);
        transaction.labels = item.labels;
        transaction.note = item.note;
        transaction.currency = item.currency;
        transaction.payment_mode = item.paymentMode;
        transaction.transaction_state = item.transactionState;
        return transaction;
    };
}

export class TransactionDtoBuilder {
    static build(transaction: Transaction) {
        return new TransactionDto(
            transaction.transaction_id,
            transaction.account,
            transaction.transaction_date,
            transaction.amount,
            transaction.category,
            transaction.labels || [],
            transaction.note || '',
            transaction.currency || 'INR',
            transaction.payment_mode || PaymentMode.CASH,
            transaction.transaction_type,
            transaction.transaction_state || TransactionStatus.COMPLETED
        );
    }
}
