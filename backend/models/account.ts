import { Bank } from './bank.js';

export class Account {
    id: number;
    account_name: string;
    account_balance: number;
    initial_balance: number;
    bank_account_number: string;
    account_type: string;
    account_icon: any;
    account_background_color: string;
    bank_account_type: string;
    bank: number;
    last_synced_on: Date;

    constructor(
        id: number,
        account_name: string,
        account_balance: number,
        initial_balance: number,
        bank_account_number: string,
        account_type: string,
        account_icon: any,
        account_background_color: string,
        bank_account_type: string,
        bank: number,
        last_synced_on: Date
    ) {
        this.id = id;
        this.account_name = account_name;
        this.account_balance = account_balance;
        this.initial_balance = initial_balance;
        this.bank_account_number = bank_account_number;
        this.account_type = account_type;
        this.account_icon = account_icon;
        this.account_background_color = account_background_color;
        this.bank_account_type = bank_account_type;
        this.bank = bank;
        this.last_synced_on = last_synced_on;
    }
}

export class AccountDto {
    id: number;
    accountName: string;
    accountBalance: number;
    initialBalance: number;
    bankAccountNumber: string;
    accountType: string;
    accountIcon: any;
    accountBackgroundColor: string;
    bankAccountType: string;
    bank?: Bank | number;

    constructor(
        id: number,
        accountName: string,
        accountBalance: number,
        initialBalance: number,
        bankAccountNumber: string,
        accountType: string,
        accountIcon: any,
        accountBackgroundColor: string,
        bankAccountType: string
    ) {
        this.id = id;
        this.accountName = accountName;
        this.accountBalance = accountBalance;
        this.initialBalance = initialBalance;
        this.bankAccountNumber = bankAccountNumber;
        this.accountType = accountType;
        this.accountIcon = accountIcon;
        this.accountBackgroundColor = accountBackgroundColor;
        this.bankAccountType = bankAccountType;
    }
}

export class AccountDtoBuilder {
    static build(account: Account) {
        return new AccountDto(
            account.id,
            account.account_name,
            account.account_balance,
            account.initial_balance,
            account.bank_account_number,
            account.account_type,
            account.account_icon,
            account.account_background_color,
            account.bank_account_type
        );
    }

    static buildFromJson(item: any) {
        return new AccountDto(
            item.id,
            item.accountName,
            Number.parseFloat(item.accountBalance),
            Number.parseFloat(item.initialBalance),
            item.bankAccountNumber,
            item.accountType,
            item.accountIcon,
            item.accountBackgroundColor,
            item.bankAccountType
        );
    }
}

export class AccountBuilder {
    static build(item: AccountDto) {
        return new Account(
            item.id,
            item.accountName,
            item.accountBalance,
            item.initialBalance,
            item.bankAccountNumber,
            item.accountType,
            item.accountIcon,
            item.accountBackgroundColor,
            item.bankAccountType,
            item.bank as number,
            new Date()
        );
    }
}
