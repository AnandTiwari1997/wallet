import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Bill {
    @PrimaryColumn()
    bill_id: string;

    @Column()
    bill_name: string;

    @Column()
    vendor_name: string;

    @Column()
    bill_status: string;

    @Column()
    label: string;

    @Column()
    category: string;

    @CreateDateColumn()
    previous_bill_date: Date;

    @CreateDateColumn()
    next_bill_date: Date;

    @CreateDateColumn()
    transaction_date: Date | undefined;

    @Column()
    auto_sync: boolean;

    @Column()
    bill_amount: number;

    @Column()
    bill_consumer_no: string;

    constructor(
        bill_id: string,
        bill_name: string,
        vendor_name: string,
        bill_status: string,
        label: string,
        category: string,
        previous_bill_date: Date,
        next_bill_date: Date,
        transaction_date: Date | undefined,
        auto_sync: boolean,
        bill_amount: number,
        bill_consumer_no: string
    ) {
        this.bill_id = bill_id;
        this.bill_name = bill_name;
        this.vendor_name = vendor_name;
        this.bill_status = bill_status;
        this.label = label;
        this.category = category;
        this.previous_bill_date = previous_bill_date;
        this.next_bill_date = next_bill_date;
        this.transaction_date = transaction_date;
        this.auto_sync = auto_sync;
        this.bill_amount = bill_amount;
        this.bill_consumer_no = bill_consumer_no;
    }
}
