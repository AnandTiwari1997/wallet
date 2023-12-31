import Select, { SelectOption } from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';
import { Account, Bank } from '../../data/models';
import { useEffect, useState } from 'react';
import { addAccount, ApiResponse, getBanks, updateAccount } from '../../modules/backend/BackendApi';
import { format, parse } from 'date-fns';

const AddAccount = ({ account, onSubmit }: { account?: Account; onSubmit: (success: boolean, data: Account | undefined) => any | void }) => {
    const [accountId, setAccountId] = useState<number>(0);
    const [accountType, setAccountType] = useState<string>('CASH');
    const [accountName, setAccountName] = useState<string>('');
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));
    const [bankId, setBankId] = useState<number>(0);
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
                    setBanks({ ...banks });
                    return { value: value1.bank_id, label: value1.name };
                });
            setBankOption(options);
        });
    };

    useEffect(() => {
        setEdit(!!account);
        setAccountId(account ? account.account_id : 0);
        setAccountType(account ? account.account_type : 'CASH');
        setAccountName(account ? account.account_name : '');
        setAccountNumber(account ? account.account_number : '');
        setAccountBalance(account ? account.account_balance : 0);
        setStartDate(format(account ? new Date(account.start_date) : new Date(), 'dd-MM-yyyy'));
        setBankId(account ? (account.bank ? account.bank.bank_id : 0) : 0);
        setSearchText(account ? account.search_text : '');
        _getBanks();
    }, [account]);

    const subAccountTypeOptions = (accountType: string) => {
        if (accountType === 'BANK') {
            return [
                { value: 'SAVING_ACCOUNT', label: 'Saving Account' },
                { value: 'CURRENT_ACCOUNT', label: 'Current Account' }
            ];
        } else if (accountType === 'LOAN') {
            return [
                { value: 'HOME_LOAN', label: 'Home Loan' },
                { value: 'PERSONAL_LOAN', label: 'Personal Loan' }
            ];
        }
        return [];
    };

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
                            if (event.target.value !== 'CASH') {
                                _getBanks();
                            } else {
                                setBankOption([]);
                            }
                            setAccountType(event.target.value);
                        }}
                    />
                    <p style={{ margin: '0.5em 0' }}>Account Name</p>
                    <TextBox setValue={setAccountName} value={accountName} placeholder={'Enter Account Name'} />

                    {accountType !== 'CASH' && (
                        <>
                            <p style={{ margin: '0.5em 0' }}>Bank</p>
                            <Select
                                selectedOption={bankId}
                                options={bankOption}
                                onChange={(event) => {
                                    setBankId(Number.parseInt(event.target.value));
                                }}
                            />

                            <p style={{ margin: '0.5em 0' }}>Account/Card Number</p>
                            <TextBox setValue={setAccountNumber} value={accountNumber} placeholder={'Enter Account/Card Number'} />

                            <p>Loan Start Date</p>
                            <TextBox setValue={setStartDate} value={startDate} placeholder={'Enter Loan Start Date in dd-MM-yyyy'} />
                        </>
                    )}

                    {(accountType == 'LOAN' || accountType == 'CREDIT_CARD') && (
                        <>
                            <p style={{ margin: '0.5em 0' }}>Search Text</p>
                            <TextBox setValue={setSearchText} value={searchText} placeholder={'Enter Text to filter mail'} />
                        </>
                    )}

                    <p style={{ margin: '0.5em 0' }}>Balance</p>
                    <TextBox setValue={setAccountBalance} value={accountBalance} type={'number'} placeholder={'Enter Balance'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                setBankOption([]);
                                let account: Account = {
                                    account_id: accountId,
                                    account_name: accountName,
                                    account_balance: accountBalance,
                                    account_number: accountNumber,
                                    account_type: accountType,
                                    bank: banks[bankId],
                                    start_date: parse(startDate, 'dd-MM-yyyy', new Date()),
                                    search_text: searchText
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
