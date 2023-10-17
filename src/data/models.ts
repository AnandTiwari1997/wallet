import { Category, PaymentMode, TransactionStatus, TransactionType } from '../../backend/database/models/account-transaction';

export interface Account {
    account_id: number;
    account_type: string;
    account_name: string;
    account_balance: number;
    account_number: string;
    bank: Bank;
    start_date: Date;
}

export interface Bank {
    bank_id: number;
    name: string;
    icon: string;
    alert_email_id: string;
    primary_color: string;
}

export interface ProvidentFundTransaction {
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
}

export interface MutualFundTransaction {
    transactionId: string;
    fundName: string;
    portfolioNumber: string;
    transactionDate: Date;
    amount: number;
    isCredit: boolean;
    nav: number;
    units: number;
    latestNav: number;
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

export const billCategoryMap: { [key: string]: string } = {
    INTERNET_BILL: 'Internet',
    ELECTRICITY_BILL: 'Electricity',
    MUTUAL_FUND_BILL: 'Mutual Fund',
    MONTHLY_INSTALLMENT_BILL: 'EMI'
};

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
}
