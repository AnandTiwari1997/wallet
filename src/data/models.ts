import { Category, PaymentMode, TransactionStatus, TransactionType } from '../../backend/database/models/account-transaction';

export interface Account {
    account_id: number;
    account_type: string;
    account_name: string;
    account_balance: number;
    account_number: string;
    bank: Bank;
    start_date: Date;
    search_text: string;
}

export interface Bank {
    bank_id: number;
    name: string;
    icon: string;
    alert_email_id: string;
    primary_color: string;
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

export const billCategory = [
    { value: 'INTERNET_BILL', label: 'Internet' },
    { value: 'ELECTRICITY_BILL', label: 'Electricity' },
    { value: 'MUTUAL_FUND_BILL', label: 'Mutual Fund' },
    { value: 'MONTHLY_INSTALLMENT_BILL', label: 'EMI' }
];

export const billCategoryMap: {
    [key: string]: string;
} = {
    INTERNET_BILL: 'Internet',
    ELECTRICITY_BILL: 'Electricity',
    MUTUAL_FUND_BILL: 'Mutual Fund',
    MONTHLY_INSTALLMENT_BILL: 'EMI',
    RENT: 'Rent'
};

export class AccountType {
    static CASH = { label: 'Cash', value: 'CASH' };
    static BANK = { label: 'Bank', value: 'BANK' };
    static LOAN = { label: 'Loan', value: 'LOAN' };
    static CREDIT_CARD = { label: 'Credit Card', value: 'CREDIT_CARD' };

    static typeMap: {
        [key: string]: {
            label: string;
            value: string;
        };
    } = {
        CASH: AccountType.CASH,
        BANK: AccountType.BANK,
        LOAN: AccountType.LOAN,
        CREDIT_CARD: AccountType.CREDIT_CARD
    };

    static getLabel(value: string) {
        return AccountType.typeMap[value.toUpperCase()].label;
    }

    static get() {
        return [AccountType.CASH, AccountType.BANK, AccountType.LOAN, AccountType.CREDIT_CARD];
    }
}

export interface Bill {
    bill_id: string;
    bill_name: string;
    vendor_name: string;
    bill_status: string;
    label: string;
    category: string;
    previous_bill_date: string;
    next_bill_date: string;
    transaction_date: string | undefined;
    auto_sync: boolean;
    bill_amount: number;
    bill_consumer_no: string;
}

export interface MutualFundTransaction {
    transaction_id: string;
    fund_name: string;
    portfolio_number: string;
    transaction_date: Date;
    description: string;
    amount: number;
    is_credit: boolean;
    nav: number;
    units: number;
    latest_nav: number;
}

export interface ProvidentFundTransaction {
    transaction_id: string;
    wage_month: string;
    transaction_date: Date;
    description: string;
    epf_amount: number;
    eps_amount: number;
    employee_contribution: number;
    employer_contribution: number;
    pension_amount: number;
    is_credit: boolean;
    financial_year: string;
}

export interface Broker {
    broker_id: string;
    broker_name: string;
    broker_icon: string;
    broker_email_id: string;
    broker_primary_color: string;
    broker_exchange: string;
}

export interface DematAccount {
    account_bo_id: string;
    account_client_id: string;
    account_name: string;
    broker: Broker;
    account_type: string;
    start_date: Date;
}

export interface Holding {
    holding_id: string;
    stock_name: string;
    stock_symbol_code: string;
    stock_symbol: string;
    stock_exchange: string;
    stock_isin: string;
    current_price: number;
    total_shares: string;
    invested_amount: string;
    account_id: string;
}

export interface StockTransaction {
    transaction_id: string;
    holding: Holding;
    demat_account: DematAccount;
    transaction_date: Date;
    transaction_type: string;
    stock_quantity: number;
    stock_transaction_price: number;
    amount: number;
    dated: Date;
}
