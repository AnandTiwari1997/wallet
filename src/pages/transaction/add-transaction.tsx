import { useEffect, useState } from 'react';
import { Account, Transaction } from '../../data/models';
import Select from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';
import { Category, PaymentMode, TransactionStatus, TransactionType } from '../../data/transaction-data';
import Button from '../../modules/button/button';

const AddTransaction = ({ accounts }: { accounts: Account[] }) => {
    const [account, setAccount] = useState<Account>(accounts[0]);
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState(Category.OTHERS.value);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(TransactionStatus.COMPLETED.value);
    const [paymentMode, setPaymentMode] = useState(PaymentMode.CASH.value);
    const [type, setType] = useState(TransactionType.EXPENSE.value);
    const [accountOptions, setAccountOptions] = useState<{ [key: string]: Account }>({});

    useEffect(() => {
        accounts.forEach((account) => {
            accountOptions[account.account_id] = account;
            setAccountOptions({ ...accountOptions });
        });
    }, []);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Bill Category</p>
                    <Select
                        selectedOption={account.account_id}
                        options={accounts.map((account) => {
                            return {
                                value: account.account_id,
                                label: account.account_name
                            };
                        })}
                        onChange={(event) => setAccount(accountOptions[event.target.value])}
                    />

                    <p style={{ margin: '0.5em 0' }}>Category</p>
                    <Select selectedOption={category} options={Category.get()} onChange={(event) => setCategory(event.target.value)} />

                    <p style={{ margin: '0.5em 0' }}>Status</p>
                    <Select selectedOption={status} options={TransactionStatus.get()} onChange={(event) => setStatus(event.target.value)} />

                    <p style={{ margin: '0.5em 0' }}>Payment Mode</p>
                    <Select selectedOption={paymentMode} options={PaymentMode.get()} onChange={(event) => setPaymentMode(event.target.value)} />

                    <p style={{ margin: '0.5em 0' }}>Type</p>
                    <Select selectedOption={type} options={TransactionType.get()} onChange={(event) => setType(event.target.value)} />

                    <p style={{ margin: '0.5em 0' }}>Amount</p>
                    <TextBox setValue={setAmount} value={amount} placeholder={'Enter Transaction Amount'} />

                    <p style={{ margin: '0.5em 0' }}>Description</p>
                    <TextBox setValue={setNote} value={note} placeholder={'Enter Description'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <Button
                            onClick={() => {
                                let transaction: Transaction = {
                                    amount: amount,
                                    account: account,
                                    transaction_date: new Date(),
                                    transaction_type: type,
                                    transaction_state: status,
                                    payment_mode: paymentMode,
                                    category: category,
                                    note: note,
                                    labels: [],
                                    dated: new Date(),
                                    currency: 'INR',
                                    transaction_id: ''
                                };
                                console.log(transaction);
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddTransaction;
