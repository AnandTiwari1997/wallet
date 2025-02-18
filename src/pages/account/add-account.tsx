import { addAccount, ApiResponse, getBanks, updateAccount } from 'backend/BackendApi';
import { Account, Bank } from 'data/models';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, InputField, Select, SelectOption } from 'boxed-material-ui';

const AddAccount = ({
    account,
    onSubmit
}: {
    account?: Account;
    onSubmit: (success: boolean, data: Account | undefined) => any | void;
}) => {
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
            const options: SelectOption[] = value.results
                .filter((value1) => {
                    return value1.bank_id.toString() !== '0';
                })
                .map((value1) => {
                    banks[value1.bank_id] = value1;
                    setBanks({ ...banks });
                    return { value: value1.bank_id, label: value1.name };
                });
            setBankOption(options);
            if (bankId === 0) {
                setBankId(options[0].value);
            }
        });
    };

    useEffect(() => {
        setEdit(!!account);
        setAccountId(account ? account.account_id ?? 0 : 0);
        setAccountType(account ? account.account_type : 'CASH');
        setAccountName(account ? account.account_name : '');
        setAccountNumber(account ? account.account_number : '');
        setAccountBalance(account ? account.account_balance : 0);
        setStartDate(format(account ? new Date(account.start_date) : new Date(), 'dd-MM-yyyy'));
        setSearchText(account ? account.search_text : '');
        if (account) {
            setBankId(account.bank ? account.bank.bank_id : 0);
        } else {
            setBankId(0);
        }
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
            <div style={{ width: '250px' }}>
                <div style={{ margin: '0.5em 0' }} />
                <Select
                    label={'Account Type'}
                    selectedOption={accountType}
                    options={[
                        { value: 'CASH', label: 'Cash' },
                        { value: 'BANK', label: 'Bank' },
                        { value: 'LOAN', label: 'Loan' },
                        { value: 'CREDIT_CARD', label: 'Credit Card' }
                    ]}
                    onSelectionChange={(event) => {
                        if (event.value !== 'CASH') {
                            _getBanks();
                        } else {
                            setBankOption([]);
                        }
                        setAccountType(event.value);
                    }}
                />
                <div style={{ margin: '0.5em 0' }} />
                <InputField
                    label={'Account Name'}
                    value={accountName}
                    placeholder={'Enter Account Name'}
                    onChange={(event) => {
                        setAccountName(event.target.value);
                    }}
                />

                {accountType !== 'CASH' && (
                    <>
                        <div style={{ margin: '0.5em 0' }} />
                        <Select
                            label={'Bank'}
                            onSelectionChange={(event) => {
                                setBankId(Number.parseInt(event.value));
                            }}
                            loading={bankOption.length === 0}
                            options={bankOption}
                            selectedOption={bankId}
                        />

                        <div style={{ margin: '0.5em 0' }} />
                        <InputField
                            label={'Account/Card Number'}
                            value={accountNumber}
                            placeholder={'Enter Account/Card Number'}
                            onChange={(event) => {
                                setAccountNumber(event.target.value);
                            }}
                        />

                        <div style={{ margin: '0.5em 0' }} />
                        <InputField
                            label={'Loan Start Date'}
                            showLabel={true}
                            value={startDate}
                            placeholder={'Enter Loan Start Date in dd-MM-yyyy'}
                            onChange={(event) => {
                                setStartDate(event.target.value);
                            }}
                        />
                    </>
                )}

                {(accountType === 'LOAN' || accountType === 'CREDIT_CARD') && (
                    <>
                        <div style={{ margin: '0.5em 0' }} />
                        <InputField
                            label={'Search Text'}
                            value={searchText}
                            placeholder={'Enter Text to filter mail'}
                            onChange={(event) => {
                                setSearchText(event.target.value);
                            }}
                        />
                    </>
                )}

                <div style={{ margin: '0.5em 0' }} />
                <InputField
                    label={'Balance'}
                    value={accountBalance}
                    type={'number'}
                    placeholder={'Enter Balance'}
                    onChange={(event) => {
                        setAccountBalance(Number.parseInt(event.target.value));
                    }}
                />

                <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <Button
                        appearance={'filled'}
                        className="button"
                        onClick={() => {
                            setBankOption([]);
                            const account: Account = {
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
                    </Button>
                </div>
            </div>
        </>
    );
};

export default AddAccount;
