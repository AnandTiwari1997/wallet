import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('stock_broker')
export class Broker {
    @PrimaryColumn()
    broker_id: string;

    @Column()
    broker_name: string;

    @Column()
    broker_icon: string;

    @Column()
    broker_email_id: string;

    @Column()
    broker_primary_color: string;

    constructor(
        broker_id: string,
        broker_name: string,
        broker_icon: string,
        broker_email_id: string,
        broker_primary_color: string
    ) {
        this.broker_id = broker_id;
        this.broker_name = broker_name;
        this.broker_icon = broker_icon;
        this.broker_email_id = broker_email_id;
        this.broker_primary_color = broker_primary_color;
    }
}
