import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('mutual_fund')
export class MutualFundTransaction {
    @PrimaryColumn()
    transaction_id: string;

    @Column()
    fund_name: string;

    @Column()
    portfolio_number: string;

    @CreateDateColumn()
    transaction_date: Date;

    @Column()
    description: string;

    @Column()
    amount: number;

    @Column()
    is_credit: boolean;

    @Column()
    nav: number;

    @Column()
    units: number;

    @Column()
    latest_nav: number;

    @Column()
    isin: string;

    constructor(
        transaction_id: string,
        fund_name: string,
        portfolio_number: string,
        transaction_date: Date,
        description: string,
        amount: number,
        is_credit: boolean,
        nav: number,
        units: number,
        latest_nav: number,
        isin: string
    ) {
        this.transaction_id = transaction_id;
        this.fund_name = fund_name;
        this.portfolio_number = portfolio_number;
        this.transaction_date = transaction_date;
        this.description = description;
        this.amount = amount;
        this.is_credit = is_credit;
        this.nav = nav;
        this.units = units;
        this.latest_nav = latest_nav;
        this.isin = isin;
    }
}
