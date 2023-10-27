export interface Bill {
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
    bill_consumer_no: string;
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
    bill_consumer_no: string;
}

export class BillBuilder {
    static buildFromEntity(item: IBill): Bill {
        return {
            bill_id: item.bill_id,
            bill_name: item.bill_name,
            vendor_name: item.vendor_name,
            bill_status: item.bill_status,
            label: item.label,
            category: item.category,
            previous_bill_date: new Date(item.previous_bill_date),
            next_bill_date: new Date(item.next_bill_date),
            transaction_date: item.transaction_date ? new Date(item.transaction_date) : undefined,
            auto_sync: item.auto_sync,
            bill_amount: item.bill_amount,
            bill_consumer_no: item.bill_consumer_no
        };
    }
}
