import { Bank } from './bank.js';

export class Account {
    account_id: number;
    account_name: string;
    account_balance: number;
    initial_balance: number;
    bank_account_number: string;
    account_type: string;
    account_icon: any;
    account_background_color: string;
    bank_account_type: string;
    bank: Bank | undefined;
    last_synced_on: Date;

    constructor(
        account_id: number,
        account_name: string,
        account_balance: number,
        initial_balance: number,
        bank_account_number: string,
        account_type: string,
        account_icon: any,
        account_background_color: string,
        bank_account_type: string,
        bank: Bank | undefined,
        last_synced_on: Date
    ) {
        this.account_id = account_id;
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

export interface IAccount {
    account_id: number;
    account_name: string;
    account_balance: number;
    initial_balance: number;
    bank_account_number: string;
    account_type: string;
    account_icon: any;
    account_background_color: string;
    bank_account_type: string;
    last_synced_on: string;
    bank: number;
    bank_id: number;
    name: string;
    icon: string;
    primary_color: string;
    alert_email_id: string;
}

export class AccountBuilder {
    static buildFromEntity(item: IAccount) {
        let bank: Bank | undefined = undefined;
        if (item.bank_id) bank = new Bank(item.bank_id, item.name, item.icon, item.alert_email_id, item.primary_color);
        else bank = new Bank(item.bank, '', '', '', '');
        return new Account(
            item.account_id,
            item.account_name,
            item.account_balance,
            item.initial_balance,
            item.bank_account_number,
            item.account_type,
            item.account_icon,
            item.account_background_color,
            item.bank_account_type,
            bank,
            item.last_synced_on ? new Date(item.last_synced_on) : new Date()
        );
    }

    static buildFromClient(item: any) {
        return new Account(
            item.account_id,
            item.account_name,
            item.account_balance,
            item.initial_balance,
            item.bank_account_number,
            item.account_type,
            item.account_icon,
            item.account_background_color,
            item.bank_account_type,
            item.bank as Bank,
            item.last_synced_on ? new Date(item.last_synced_on) : new Date()
        );
    }
}
