import { Holding } from './holding.js';
import { DematAccount } from './demat-account.js';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('stock')
export class StockTransaction {
    @PrimaryColumn()
    transaction_id: string;

    @Column()
    holding_id: string;

    @Column()
    demat_account_id: string;

    @ManyToOne(() => Holding, {
        eager: false
    })
    @JoinColumn({ name: 'holding_id' })
    holding: Holding;

    @ManyToOne(() => DematAccount, {
        eager: false
    })
    @JoinColumn({ name: 'demat_account_id' })
    demat_account: DematAccount;

    @CreateDateColumn()
    transaction_date: Date;

    @Column()
    transaction_type: string;

    @Column()
    stock_quantity: number;

    @Column()
    stock_transaction_price: number;

    @Column()
    amount: number;

    @CreateDateColumn()
    dated: Date;

    constructor(
        transaction_id: string,
        holding_id: string,
        demat_account_id: string,
        holding: Holding,
        demat_account: DematAccount,
        transaction_date: Date,
        transaction_type: string,
        stock_quantity: number,
        stock_transaction_price: number,
        amount: number,
        dated: Date
    ) {
        this.transaction_id = transaction_id;
        this.holding_id = holding_id;
        this.demat_account_id = demat_account_id;
        this.holding = holding;
        this.demat_account = demat_account;
        this.transaction_date = transaction_date;
        this.transaction_type = transaction_type;
        this.stock_quantity = stock_quantity;
        this.stock_transaction_price = stock_transaction_price;
        this.amount = amount;
        this.dated = dated;
    }
}
