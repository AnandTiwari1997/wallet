import { addTransaction } from 'backend/BackendApi';
import { Button, InputField, Select } from 'boxed-material-ui';
import { Account, Transaction } from 'data/models';
import { Category, PaymentMode, TransactionStatus, TransactionType } from 'data/transaction-data';
import { format, parse } from 'date-fns';
import { DateInput } from 'modules';
import React, { useEffect, useState } from 'react';

const AddTransaction = ({
    accounts,
    onSubmit
}: {
    accounts: Account[];
    onSubmit: (success: boolean, data: Transaction | undefined) => any;
}) => {
    const [account, setAccount] = useState<Account>(accounts[0]);
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState(Category.OTHER.value);
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
    }, [accountOptions, accounts]);

    return (
        <>
            <div style={{ width: '350px', overflow: 'auto' }}>
                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Bill Category'}
                    selectedOption={account.account_id}
                    options={accounts.map((account) => {
                        return {
                            value: account.account_id,
                            label: account.account_name
                        };
                    })}
                    onSelectionChange={(event) => setAccount(accountOptions[event.value])}
                />

                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Category'}
                    selectedOption={category}
                    options={Category.get()}
                    onSelectionChange={(event) => setCategory(event.value)}
                />

                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Status'}
                    selectedOption={status}
                    options={TransactionStatus.get()}
                    onSelectionChange={(event) => setStatus(event.value)}
                />

                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Payment Mode'}
                    selectedOption={paymentMode}
                    options={PaymentMode.get()}
                    onSelectionChange={(event) => setPaymentMode(event.value)}
                />

                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Type'}
                    selectedOption={type}
                    options={TransactionType.get()}
                    onSelectionChange={(event) => setType(event.value)}
                />

                <div style={{ margin: '0.5em 0' }} />
                <InputField
                    label={'Amount'}
                    value={amount}
                    placeholder={'Enter Transaction Amount'}
                    onChange={(event) => {
                        if (event.target.value === '') {
                            return;
                        }
                        setAmount(Number.parseInt(event.target.value));
                    }}
                />

                <div style={{ margin: '0.5em 0' }} />
                <InputField
                    label={'Description'}
                    value={note}
                    placeholder={'Enter Description'}
                    onChange={(event) => {
                        setNote(event.target.value);
                    }}
                />

                <p style={{ margin: '0.5em 0' }}>Date</p>
                <DateInput value={transactionDate} />

                <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <Button
                        onClick={() => {
                            const transaction: Transaction = {
                                amount: amount,
                                account_id: account.account_id,
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
