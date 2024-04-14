import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DematAccount } from './demat-account.js';

@Entity()
export class Holding {
    @PrimaryColumn()
    holding_id: string;

    @Column()
    stock_name: string;

    @Column()
    stock_symbol_code: string;

    @Column()
    stock_symbol: string;

    @Column()
    stock_exchange: string;

    @Column()
    stock_isin: string;

    @Column()
    total_shares: number;

    @Column()
    invested_amount: number;

    @Column()
    current_price: number;

    @Column()
    account_id: string;

    @ManyToOne(() => DematAccount, {
        eager: true
    })
    @JoinColumn({ name: 'account_id' })
    dematAccount: DematAccount;

    constructor(
        holding_id: string,
        stock_name: string,
        stock_symbol_code: string,
        stock_symbol: string,
        stock_exchange: string,
        stock_isin: string,
        total_shares: number,
        invested_amount: number,
        current_price: number,
        account_id: string,
        dematAccount: DematAccount
    ) {
        this.holding_id = holding_id;
        this.stock_name = stock_name;
        this.stock_symbol_code = stock_symbol_code;
        this.stock_symbol = stock_symbol;
        this.stock_exchange = stock_exchange;
        this.stock_isin = stock_isin;
        this.total_shares = total_shares;
        this.invested_amount = invested_amount;
        this.current_price = current_price;
        this.account_id = account_id;
        this.dematAccount = dematAccount;
    }
}
