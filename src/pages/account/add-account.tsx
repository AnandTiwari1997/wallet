import Select, { SelectOption } from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';
import { Account, Bank } from '../../data/account-data';
import { useEffect, useState } from 'react';
import { addAccount, ApiResponse, getBanks, updateAccount } from '../../modules/backend/BackendApi';

const AddAccount = ({ account, onSubmit }: { account?: Account; onSubmit: (success: boolean, data: Account | undefined) => any | void }) => {
    const [accountType, setAccountType] = useState<string>('CASH');
    const [accountName, setAccountName] = useState<string>('');
    const [initialBalance, setInitialBalance] = useState<string>('0');
    const [bankAccountType, setBankAccountType] = useState<string>('SAVING_ACCOUNT');
    const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
    const [bank, setBank] = useState<number>(0);
    const [banks, setBanks] = useState<{
        [key: string]: Bank;
    }>({});
    const [bankOption, setBankOption] = useState<SelectOption[]>([]);
    const [edit, setEdit] = useState<boolean>(false);

    const _getBanks = () => {
        getBanks().then((value: ApiResponse<Bank>) => {
            let options: SelectOption[] = value.results
                .filter((value1) => {
                    return value1.bank_id.toString() !== '0';
                })
                .map((value1) => {
                    banks[value1.bank_id] = value1;
                    return { value: value1.bank_id, label: value1.name };
                });
            setBankOption(options);
        });
    };

    useEffect(() => {
        setEdit(!!account);
        setAccountType(account ? account.account_type : 'CASH');
        setAccountName(account ? account.account_name : '');
        setInitialBalance(account ? account.initial_balance.toString() : '0');
        setBankAccountType(account ? account.bank_account_type : 'SAVING_ACCOUNT');
        setBankAccountNumber(account ? account.bank_account_number : '');
        setBank(account ? (account.bank ? account.bank.bank_id : 0) : 0);
        _getBanks();
    }, [account]);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Account Type</p>
                    <Select
                        selectedOption={accountType}
                        options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'BANK', label: 'Bank' },
                            { value: 'LOAN', label: 'Loan' },
                            { value: 'CREDIT_CARD', label: 'Credit Card' }
                        ]}
                        onChange={(event) => {
                            if (event.target.value === 'BANK') {
                                _getBanks();
                            } else {
                                setBankOption([]);
                            }
                            setAccountType(event.target.value);
                        }}
                    />
                    <p style={{ margin: '0.5em 0' }}>Account Name</p>
                    <TextBox setValue={setAccountName} value={accountName} placeholder={'Enter Account Name'} />

                    {accountType === 'BANK' && (
                        <>
                            <p style={{ margin: '0.5em 0' }}>Bank</p>
                            <Select
                                selectedOption={bank}
                                options={bankOption}
                                onChange={(event) => {
                                    setBank(Number.parseInt(event.target.value));
                                }}
                            />

                            <p style={{ margin: '0.5em 0' }}>Bank Account Type</p>
                            <Select
                                selectedOption={bankAccountType}
                                options={[
                                    { value: 'SAVING_ACCOUNT', label: 'Saving Account' },
                                    { value: 'CURRENT_ACCOUNT', label: 'Current Account' }
                                ]}
                                onChange={(event) => {
                                    setBankAccountType(event.target.value);
                                }}
                            />

                            <p style={{ margin: '0.5em 0' }}>Bank Account Number</p>
                            <TextBox setValue={setBankAccountNumber} value={bankAccountNumber} placeholder={'Enter Bank Account Number'} />
                        </>
                    )}

                    <p style={{ margin: '0.5em 0' }}>Initial Balance</p>
                    <TextBox setValue={setInitialBalance} value={initialBalance} type={'number'} placeholder={'Enter Initial Balance'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                setBankOption([]);
                                let account: Account = {
                                    account_id: 0,
                                    account_name: accountName,
                                    account_balance: Number.parseFloat(initialBalance),
                                    initial_balance: Number.parseFloat(initialBalance),
                                    bank_account_number: bankAccountNumber,
                                    account_type: accountType,
                                    bank_account_type: bankAccountType,
                                    account_icon: '',
                                    account_background_color: '',
                                    bank: banks[bank]
                                };
                                if (edit) {
                                    updateAccount(account)
                                        .then((value) => {
                                            onSubmit(true, value.results[0]);
                                        })
                                        .catch((reason) => {
                                            onSubmit(true, undefined);
                                        });
                                } else {
                                    addAccount(account)
                                        .then((value) => {
                                            onSubmit(true, value.results[0]);
                                        })
                                        .catch((reason) => {
                                            onSubmit(true, undefined);
                                        });
                                }
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
