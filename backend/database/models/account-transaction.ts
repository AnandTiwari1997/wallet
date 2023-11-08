import { Account } from './account.js';

export class TransactionType {
    static INCOME = 'INCOME';
    static EXPENSE = 'EXPENSE';
}

export class PaymentMode {
    static CASH = 'CASH';
    static BANK_TRANSFER = 'BANK_TRANSFER';
    static MOBILE_TRANSFER = 'MOBILE_TRANSFER';
    static CHEQUE = 'CHEQUE';
}

export class TransactionStatus {
    static COMPLETED = 'COMPLETED';
    static PENDING = 'PENDING';
}

export class Category {
    static SALARY = 'SALARY';
    static FOOD = 'FOOD';
    static FUEL = 'FUEL';
    static PHONE_RECHARGE = 'PHONE_RECHARGE';
    static BROADBAND_RECHARGE = 'BROADBAND_RECHARGE';
    static DIVIDEND = 'DIVIDEND';
    static INTEREST_RECEIVED = 'INTEREST_RECEIVED';
    static OTHER = 'OTHER';
    static INVESTMENT = 'INVESTMENT';
    static SUBSCRIPTION = 'SUBSCRIPTION';
    static RENT = 'RENT';
    static GROCERY = 'GROCERY';
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

export interface TransactionDto {
    transaction_id: string;
    account: Account;
    transaction_date: string;
    amount: number;
    category: Category;
    labels: string[];
    note: string;
    currency: string;
    payment_mode: PaymentMode;
    transaction_type: TransactionType;
    transaction_state: TransactionStatus;
    dated: string;
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

    static toTransactionDto(transaction: Transaction): TransactionDto {
        return {
            transaction_id: transaction.transaction_id,
            account: transaction.account,
            transaction_date: transaction.transaction_date.toISOString(),
            amount: transaction.amount,
            category: transaction.category,
            labels: transaction.labels || [],
            note: transaction.note || '',
            currency: transaction.currency || 'INR',
            payment_mode: transaction.payment_mode || PaymentMode.CASH,
            transaction_type: transaction.transaction_type,
            transaction_state: transaction.transaction_state || TransactionStatus.COMPLETED,
            dated: transaction.dated.toISOString()
        };
    }

    static toTransaction(transactionDto: TransactionDto): Transaction {
        return {
            transaction_id: transactionDto.transaction_id,
            account: transactionDto.account,
            transaction_date: new Date(transactionDto.transaction_date),
            amount: transactionDto.amount,
            category: transactionDto.category,
            labels: transactionDto.labels || [],
            note: transactionDto.note || '',
            currency: transactionDto.currency || 'INR',
            payment_mode: transactionDto.payment_mode || PaymentMode.CASH,
            transaction_type: transactionDto.transaction_type,
            transaction_state: transactionDto.transaction_state || TransactionStatus.COMPLETED,
            dated: new Date(transactionDto.dated)
        };
    }
}
