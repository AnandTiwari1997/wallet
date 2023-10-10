export class Bank {
    bank_id: number;
    name: string;
    icon: string;
    alert_email_id: string;
    primary_color: string;

    constructor(bank_id: number, name: string, icon: string, alert_email_id: string, primary_color: string) {
        this.bank_id = bank_id;
        this.name = name;
        this.icon = icon;
        this.alert_email_id = alert_email_id;
        this.primary_color = primary_color;
    }
}

export interface IBank {
    bank_id: number;
    name: string;
    icon: string;
    alert_email_id: string;
    primary_color: string;
}

export class BankBuilder {
    static build = (bank: IBank) => {
        return new Bank(bank.bank_id, bank.name, bank.icon, bank.alert_email_id, bank.primary_color);
    };
}
