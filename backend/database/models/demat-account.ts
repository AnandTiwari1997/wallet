import { Broker } from './broker.js';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Holding } from './holding.js';

@Entity('demat_account')
export class DematAccount {
    @PrimaryColumn()
    account_bo_id: string;

    @Column()
    account_client_id: string;

    @Column()
    account_name: string;

    @Column()
    broker_id: string;

    @ManyToOne(() => Broker, {
        eager: true
    })
    @JoinColumn({ name: 'broker_id' })
    broker: Broker;

    @CreateDateColumn()
    start_date: Date;

    @CreateDateColumn()
    last_synced_on: Date;

    constructor(
        account_bo_id: string,
        account_client_id: string,
        account_name: string,
        broker_id: string,
        broker: Broker,
        start_date: Date,
        last_synced_on: Date,
        holdings: Holding[]
    ) {
        this.account_bo_id = account_bo_id;
        this.account_client_id = account_client_id;
        this.account_name = account_name;
        this.broker_id = broker_id;
        this.broker = broker;
        this.start_date = start_date;
        this.last_synced_on = last_synced_on;
    }
}
