import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Bank {
    @PrimaryColumn()
    bank_id: number;

    @Column()
    name: string;

    @Column()
    icon: string;

    @Column()
    alert_email_id: string;

    @Column()
    primary_color: string;

    constructor(bank_id: number, name: string, icon: string, alert_email_id: string, primary_color: string) {
        this.bank_id = bank_id;
        this.name = name;
        this.icon = icon;
        this.alert_email_id = alert_email_id;
        this.primary_color = primary_color;
    }
}
