import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { Account, Transaction } from '../../data/models';
import { Category, PaymentMode, TransactionStatus, TransactionType } from '../../data/transaction-data';
import { addTransaction } from '../../modules/backend/BackendApi';
import Button from '../../modules/button/button';
import DateInput from '../../modules/date-input/date-input';
import Select from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';

const AddTransaction = ({
    accounts,
    onSubmit
}: {
    accounts: Account[];
    onSubmit: (success: boolean, data: Transaction | undefined) => any;
}) => {
    const [account, setAccount] = useState<Account>(accounts[0]);
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState(Category.OTHERS.value);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(TransactionStatus.COMPLETED.value);
    const [paymentMode, setPaymentMode] = useState(PaymentMode.CASH.value);
    const [type, setType] = useState(TransactionType.EXPENSE.value);
    const [accountOptions, setAccountOptions] = useState<{ [key: string]: Account }>({});
    const [transactionDate, setTransactionDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));

    useEffect(() => {
        accounts.forEach((account) => {
            accountOptions[account.account_id] = account;
            setAccountOptions({ ...accountOptions });
        });
    }, []);

    return (
        <>
            <div style={{ width: '350px' }}>
                <p style={{ margin: '0.5em 0' }}>Bill Category</p>
                <Select
                    selectedOption={account.account_id}
                    options={accounts.map((account) => {
                        return {
                            value: account.account_id,
                            label: account.account_name
                        };
                    })}
                    onSelectionChange={(event) => setAccount(accountOptions[event.value])}
                />

                <p style={{ margin: '0.5em 0' }}>Category</p>
                <Select
                    selectedOption={category}
                    options={Category.get()}
                    onSelectionChange={(event) => setCategory(event.value)}
                />

                <p style={{ margin: '0.5em 0' }}>Status</p>
                <Select
                    selectedOption={status}
                    options={TransactionStatus.get()}
                    onSelectionChange={(event) => setStatus(event.value)}
                />

                <p style={{ margin: '0.5em 0' }}>Payment Mode</p>
                <Select
                    selectedOption={paymentMode}
                    options={PaymentMode.get()}
                    onSelectionChange={(event) => setPaymentMode(event.value)}
                />

                <p style={{ margin: '0.5em 0' }}>Type</p>
                <Select
                    selectedOption={type}
                    options={TransactionType.get()}
                    onSelectionChange={(event) => setType(event.value)}
                />

                <p style={{ margin: '0.5em 0' }}>Amount</p>
                <TextBox
                    value={amount}
                    placeholder={'Enter Transaction Amount'}
                    onChange={(event) => {
                        setAmount(Number.parseInt(event.target.value));
                    }}
                />

                <p style={{ margin: '0.5em 0' }}>Description</p>
                <TextBox
                    value={note}
                    placeholder={'Enter Description'}
                    onChange={(event) => {
                        setNote(event.target.value);
                    }}
                />

                <p style={{ margin: '0.5em 0' }}>Date</p>
                <DateInput setValue={setTransactionDate} value={transactionDate} />

                <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <Button
                        onClick={() => {
                            const transaction: Transaction = {
                                amount: amount,
                                account: account,
                                transaction_date: parse(transactionDate, 'dd-MM-yyyy', new Date()),
                                transaction_type: type,
                                transaction_state: status,
                                payment_mode: paymentMode,
                                category: category,
                                note: JSON.stringify({
                                    transactionAmount: amount,
                                    transactionAccount: account.account_number,
                                    transactionInfo: note,
                                    transactionDate: new Date()
                                }),
                                labels: [],
                                dated: parse(transactionDate, 'dd-MM-yyyy', new Date()),
                                currency: 'INR',
                                transaction_id: ''
                            };
                            addTransaction(transaction).then((apiResponse) => {
                                onSubmit(
                                    apiResponse && apiResponse.num_found === 1,
                                    apiResponse.results ? apiResponse.results[0] : undefined
                                );
                                console.log('Saved Object', apiResponse.results);
                            });
                        }}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </>
    );
};

export default AddTransaction;
