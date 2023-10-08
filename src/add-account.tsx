import Select, { SelectOption } from './modules/select/select';
import TextBox from './modules/text-box/text-box';
import { Account, Bank } from './data/account-data';
import { useState } from 'react';
import { addAccount, ApiResponse, getBanks } from './modules/backend/BackendApi';

const AddAccount = ({ onSubmit }: { onSubmit: (success: boolean, data: Account | undefined) => any | void }) => {
    const [accountType, setAccountType] = useState<string>('CASH');
    const [accountName, setAccountName] = useState<string>('');
    const [initialBalance, setInitialBalance] = useState<string>('0');
    const [bankAccountType, setBankAccountType] = useState<string>('SAVING_ACCOUNT');
    const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
    const [bank, setBank] = useState<number>(0);
    const [banks, setBanks] = useState<SelectOption[]>([]);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Account Type</p>
                    <Select
                        options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'BANK', label: 'Bank' },
                            { value: 'LOAN', label: 'Loan' },
                            { value: 'CREDIT_CARD', label: 'Credit Card' }
                        ]}
                        onChange={(event) => {
                            if (event.target.value === 'BANK' && banks.length === 0) {
                                getBanks().then((value: ApiResponse<Bank>) => {
                                    console.log(value);
                                    let options: SelectOption[] = value.results.map((value1) => {
                                        return { value: value1.id, label: value1.name };
                                    });
                                    setBanks(options);
                                });
                            } else {
                                setBanks([]);
                            }
                            setAccountType(event.target.value);
                        }}
                    />
                    <p style={{ margin: '0.5em 0' }}>Account Name</p>
                    <TextBox value={setAccountName} placeholder={'Enter Account Name'} />

                    {accountType === 'BANK' && (
                        <>
                            <p style={{ margin: '0.5em 0' }}>Bank</p>
                            <Select
                                options={banks}
                                onChange={(event) => {
                                    setBank(Number.parseInt(event.target.value));
                                }}
                            />

                            <p style={{ margin: '0.5em 0' }}>Bank Account Type</p>
                            <Select
                                options={[
                                    { value: 'SAVING_ACCOUNT', label: 'Saving Account' },
                                    { value: 'CURRENT_ACCOUNT', label: 'Current Account' }
                                ]}
                                onChange={(event) => {
                                    setBankAccountType(event.target.value);
                                }}
                            />

                            <p style={{ margin: '0.5em 0' }}>Bank Account Number</p>
                            <TextBox value={setBankAccountNumber} placeholder={'Enter Bank Account Number'} />
                        </>
                    )}

                    <p style={{ margin: '0.5em 0' }}>Initial Balance</p>
                    <TextBox value={setInitialBalance} type={'number'} placeholder={'Enter Initial Balance'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                setBanks([]);
                                let account: Account = {
                                    id: 0,
                                    accountName: accountName,
                                    accountBalance: Number.parseFloat(initialBalance),
                                    initialBalance: Number.parseFloat(initialBalance),
                                    bankAccountNumber: bankAccountNumber,
                                    accountType: accountType,
                                    bankAccountType: bankAccountType,
                                    accountIcon: '',
                                    accountBackgroundColor: '',
                                    bank: bank
                                };
                                addAccount(account)
                                    .then((value) => {
                                        console.log(value.results[0]);
                                        console.log(value.num_found);

                                        onSubmit(true, value.results[0]);
                                    })
                                    .catch((reason) => {
                                        onSubmit(true, undefined);
                                    });
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

export default AddAccount;
