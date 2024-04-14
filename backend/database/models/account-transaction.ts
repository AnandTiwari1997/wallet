import { Account } from './account.js';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum PaymentMode {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    MOBILE_TRANSFER = 'MOBILE_TRANSFER',
    CHEQUE = 'CHEQUE',
    ATM = 'ATM'
}

export enum TransactionStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING'
}

export enum Category {
    SALARY = 'SALARY',
    FOOD = 'FOOD',
    FUEL = 'FUEL',
    PHONE_RECHARGE = 'PHONE_RECHARGE',
    BROADBAND_RECHARGE = 'BROADBAND_RECHARGE',
    DIVIDEND = 'DIVIDEND',
    INTEREST_RECEIVED = 'INTEREST_RECEIVED',
    OTHER = 'OTHER',
    INVESTMENT = 'INVESTMENT',
    SUBSCRIPTION = 'SUBSCRIPTION',
    RENT = 'RENT',
    GROCERY = 'GROCERY',
    EMI = 'EMI'
}

@Entity('account_transaction')
export class AccountTransaction {
    @PrimaryColumn()
    transaction_id: string;

    @Column()
    account_id: number;

    @ManyToOne(() => Account, {
        eager: false
    })
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @CreateDateColumn()
    transaction_date: Date;

    @Column()
    amount: number;

    @Column()
    category: Category;

    @Column('text', { default: [], array: true })
    labels: string[];

    @Column()
    note: string;

    @Column()
    currency: string;

    @Column()
    payment_mode: PaymentMode;

    @Column()
    transaction_type: TransactionType;

    @Column()
    transaction_state: TransactionStatus;

    @CreateDateColumn()
    dated: Date;

    constructor(
        transaction_id: string,
        account_id: number,
        account: Account,
        transaction_date: Date,
        amount: number,
        category: Category,
        labels: string[],
        note: string,
        currency: string,
        payment_mode: PaymentMode,
        transaction_type: TransactionType,
        transaction_state: TransactionStatus,
        dated: Date
    ) {
        this.transaction_id = transaction_id;
        this.account_id = account_id;
        this.account = account;
        this.transaction_date = transaction_date;
        this.amount = amount;
        this.category = category;
        this.labels = labels;
        this.note = note;
        this.currency = currency;
        this.payment_mode = payment_mode;
        this.transaction_type = transaction_type;
        this.transaction_state = transaction_state;
        this.dated = dated;
    }
}
