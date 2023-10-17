import { Bank } from './bank.js';

export interface Account {
    account_id: number;
    account_name: string;
    account_balance: number;
    account_number: string;
    account_type: string;
    bank: Bank;
    start_date: Date;
    last_synced_on: Date;
}

export interface AccountDto {
    account_id: number;
    account_name: string;
    account_balance: number;
    account_number: string;
    account_type: string;
    bank: Bank;
    start_date: Date;
}

export class AccountBuilder {
    static buildFromEntity(item: Account & Bank): Account {
        let bank: Bank = new Bank(item.bank_id, item.name, item.icon, item.alert_email_id, item.primary_color);
        return {
            account_id: item.account_id,
            account_name: item.account_name,
            account_balance: item.account_balance,
            account_number: item.account_number,
            account_type: item.account_type,
            bank: bank,
            start_date: new Date(item.start_date),
            last_synced_on: item.last_synced_on ? new Date(item.last_synced_on) : new Date()
        };
    }

    static toAccountDto(item: Account) {
        return {
            account_id: item.account_id,
            account_name: item.account_name,
            account_balance: item.account_balance,
            account_number: item.account_number,
            account_type: item.account_type,
            bank: item.bank as Bank,
            start_date: new Date(item.start_date)
        };
    }

    static toAccount(item: AccountDto) {
        return {
            account_id: item.account_id,
            account_name: item.account_name,
            account_balance: item.account_balance,
            account_number: item.account_number,
            account_type: item.account_type,
            bank: item.bank as Bank,
            start_date: new Date(item.start_date),
            last_synced_on: new Date()
        };
    }
}
