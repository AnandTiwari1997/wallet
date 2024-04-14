import { Bank } from './bank.js';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Account {
    @PrimaryColumn()
    account_id: number;

    @Column()
    account_name: string;

    @Column()
    account_balance: number;

    @Column()
    account_number: string;

    @Column()
    account_type: string;

    @Column()
    bank_id: number;

    @ManyToOne(() => Bank, {
        eager: false
    })
    @JoinColumn({ name: 'bank_id' })
    bank: Bank;

    @Column()
    start_date: Date;

    @Column()
    last_synced_on: Date;

    @Column()
    search_text: string;

    constructor(
        account_id: number,
        account_name: string,
        account_balance: number,
        account_number: string,
        account_type: string,
        bank_id: number,
        start_date: Date,
        last_synced_on: Date,
        search_text: string,
        bank: Bank
    ) {
        this.account_id = account_id;
        this.account_name = account_name;
        this.account_balance = account_balance;
        this.account_number = account_number;
        this.account_type = account_type;
        this.bank_id = bank_id;
        this.start_date = start_date;
        this.last_synced_on = last_synced_on;
        this.search_text = search_text;
        this.bank = bank;
    }
}
