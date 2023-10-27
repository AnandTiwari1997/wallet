import { Bill } from '../../data/models';
import Select from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';
import { useEffect, useState } from 'react';
import { addMonths, differenceInDays } from 'date-fns';
import { addBill, updateBill } from '../../modules/backend/BackendApi';
import { isBefore } from 'date-fns/esm';

const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

const AddBill = ({ bill, onSubmit }: { bill?: Bill; onSubmit: (success: boolean, data: Bill | undefined) => any | void }) => {
    const [edit, setEdit] = useState(false);
    const [vendorName, setVendorName] = useState('');
    const [billName, setBillName] = useState('');
    const [billCategory, setBillCategory] = useState('INTERNET_BILL');
    const [billingDate, setBillingDate] = useState('1');
    const [billAmount, setBillAmount] = useState<number>(0);
    const [billConsumerNo, setBillConsumerNo] = useState<string>('');
    const [billId, setBillId] = useState<string>('0');

    useEffect(() => {
        setEdit(bill !== undefined);
        console.log(bill);
        if (bill) {
            setBillId(bill.bill_id);
            setVendorName(bill.vendor_name);
            setBillName(bill.bill_name);
            setBillCategory(bill.category);
            setBillingDate(new Date(bill.next_bill_date).getDate().toString());
            setBillAmount(bill.bill_amount);
            setBillConsumerNo(bill.bill_consumer_no);
        }
    }, [bill]);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Bill Category</p>
                    <Select
                        selectedOption={billCategory}
                        options={[
                            { value: 'INTERNET_BILL', label: 'Internet' },
                            { value: 'ELECTRICITY_BILL', label: 'Electricity' },
                            { value: 'MUTUAL_FUND_BILL', label: 'Mutual Fund' },
                            { value: 'MONTHLY_INSTALLMENT_BILL', label: 'EMI' }
                        ]}
                        onChange={(event) => setBillCategory(event.target.value)}
                    />

                    <p style={{ margin: '0.5em 0' }}>Vendor Name</p>
                    <TextBox setValue={setVendorName} value={vendorName} placeholder={'Enter Vendor Name'} />

                    <p style={{ margin: '0.5em 0' }}>Consumer Number</p>
                    <TextBox setValue={setBillConsumerNo} value={billConsumerNo} placeholder={'Enter Bill Consumer Number'} />

                    <p style={{ margin: '0.5em 0' }}>Bill Name</p>
                    <TextBox setValue={setBillName} value={billName} placeholder={'Enter Bill Name'} />

                    <p style={{ margin: '0.5em 0' }}>Billing Date</p>
                    <Select
                        selectedOption={billingDate}
                        options={dates.map((date) => {
                            return { value: date.toString(), label: date.toString() };
                        })}
                        onChange={(event) => {
                            setBillingDate(event.target.value);
                        }}
                    />

                    <p style={{ margin: '0.5em 0' }}>Bill Amount</p>
                    <TextBox setValue={setBillAmount} value={billAmount} type={'number'} placeholder={'Enter Bill Amount'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                let day = Number.parseInt(billingDate);
                                let date = new Date(new Date().setDate(day));
                                if (day < new Date().getDate()) date = addMonths(date, 1);
                                let label = isBefore(new Date(), date) && differenceInDays(new Date(), date) < 7 ? 'ACTIVE' : 'NON_ACTIVE';
                                let newBill: Bill = {
                                    bill_id: billId,
                                    bill_name: billName,
                                    vendor_name: vendorName,
                                    category: billCategory,
                                    next_bill_date: date.toISOString(),
                                    previous_bill_date: date.toISOString(),
                                    transaction_date: undefined,
                                    bill_status: 'PAID',
                                    label: label,
                                    auto_sync: false,
                                    bill_amount: billAmount,
                                    bill_consumer_no: billConsumerNo
                                };
                                let promise;
                                if (edit) promise = updateBill({ data: newBill });
                                else promise = addBill({ data: newBill });
                                promise.then((value) => onSubmit(true, value.results[0]));
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddBill;
