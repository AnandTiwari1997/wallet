export class Bill {
    bill_id: string;
    bill_name: string;
    vendor_name: string;
    bill_status: string;
    label: string;
    category: string;
    previous_bill_date: Date;
    next_bill_date: Date;
    transaction_date: Date | undefined;
    auto_sync: boolean;
    bill_amount: number;

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
        bill_amount: number
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
    }
}

export interface IBill {
    bill_id: string;
    bill_name: string;
    vendor_name: string;
    bill_status: string;
    label: string;
    category: string;
    previous_bill_date: string;
    next_bill_date: string;
    transaction_date: string;
    auto_sync: boolean;
    bill_amount: number;
}

export class BillBuilder {
    static buildFromEntity(item: IBill) {
        return new Bill(
            item.bill_id,
            item.bill_name,
            item.vendor_name,
            item.bill_status,
            item.label,
            item.category,
            new Date(item.previous_bill_date),
            new Date(item.next_bill_date),
            item.transaction_date ? new Date(item.transaction_date) : undefined,
            item.auto_sync,
            item.bill_amount
        );
    }
}
