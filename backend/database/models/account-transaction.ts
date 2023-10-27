import { Account } from './account.js';

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

export interface Transaction {
    transaction_id: string;
    account: Account;
    transaction_date: Date;
    amount: number;
    category: Category;
    labels: string[];
    note: string;
    currency: string;
    payment_mode: PaymentMode;
    transaction_type: TransactionType;
    transaction_state: TransactionStatus;
    dated: Date;
}

export class TransactionBuilder {
    static buildFromEntity(transaction: Transaction & Account): Transaction {
        let account: Account = {
            account_id: transaction.account_id,
            account_name: transaction.account_name,
            account_type: transaction.account_type,
            account_balance: transaction.account_balance,
            bank: transaction.bank,
            last_synced_on: transaction.last_synced_on,
            start_date: transaction.start_date,
            account_number: transaction.account_number,
            search_text: transaction.search_text
        };
        return {
            transaction_id: transaction.transaction_id,
            account: account,
            transaction_date: new Date(transaction.transaction_date),
            amount: transaction.amount,
            category: transaction.category,
            labels: transaction.labels || [],
            note: transaction.note || '',
            currency: transaction.currency || 'INR',
            payment_mode: transaction.payment_mode || PaymentMode.CASH,
            transaction_type: transaction.transaction_type,
            transaction_state: transaction.transaction_state || TransactionStatus.COMPLETED,
            dated: new Date(transaction.dated)
        };
    }
}
