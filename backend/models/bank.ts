export class Bank {
    id: number;
    name: string;
    icon: string;
    alert_email_id: string;
    primary_color: string;

    constructor(id: number, name: string, icon: string, alert_email_id: string, primary_color: string) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.alert_email_id = alert_email_id;
        this.primary_color = primary_color;
    }
}

export class BankDto {
    id: number;
    name: string;
    icon: string;
    alertEmailId: string;
    primaryColor: string;

    constructor(id: number, name: string, icon: string, alertEmailId: string, primaryColor: string) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.alertEmailId = alertEmailId;
        this.primaryColor = primaryColor;
    }
}

export class BankDtoBuilder {
    static build = (bank: Bank) => {
        return new BankDto(bank.id, bank.name, bank.icon, bank.alert_email_id, bank.primary_color);
    };
}
