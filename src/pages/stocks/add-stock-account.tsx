import { addStockAccount, getBroker } from 'backend/BackendApi';
import { InputField, Select, SelectOption } from 'boxed-material-ui';
import { Broker, DematAccount } from 'data/models';
import { format, parse } from 'date-fns';
import { DateInput } from 'modules';
import React, { useEffect, useState } from 'react';

const AddStockAccount = ({
    account,
    onSubmit
}: {
    account?: DematAccount;
    onSubmit: (success: boolean, data: DematAccount | undefined) => any | void;
}) => {
    const [accountBoId, setAccountBoId] = useState<string>('');
    const [accountType, setAccountType] = useState<string>('CASH');
    const [accountName, setAccountName] = useState<string>('');
    const [accountClientId, setAccountClientId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));
    const [brokerId, setBrokerId] = useState<string>('');
    const [brokers, setBrokers] = useState<{
        [key: string]: Broker;
    }>({});
    const [brokerOption, setBrokerOption] = useState<SelectOption[]>([]);
    const [edit, setEdit] = useState<boolean>(false);

    const _getBrokers = () => {
        getBroker({}).then((apiResponse) => {
            const options: SelectOption[] = apiResponse.results
                .filter((value1) => {
                    return value1.broker_id.toString() !== '0';
                })
                .map((value1) => {
                    brokers[value1.broker_id] = value1;
                    setBrokers({ ...brokers });
                    return { value: value1.broker_id, label: value1.broker_name };
                });
            setBrokerOption(options);
            if (brokerId.length === 0) {
                setBrokerId(options[0].value);
            }
        });
    };

    useEffect(() => {
        setEdit(!!account);
        setAccountBoId(account ? account.account_bo_id : '');
        setAccountClientId(account ? account.account_client_id : '');
        setAccountName(account ? account.account_name : '');
        setStartDate(format(account ? new Date(account.start_date) : new Date(), 'dd-MM-yyyy'));
        if (account) {
            setBrokerId(account.broker ? account.broker.broker_id : '');
        } else {
            setBrokerId('');
        }
        _getBrokers();
    }, [account]);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <div style={{ margin: '0.5em 0' }} />
                    <InputField
                        label={'Account BO Id'}
                        value={accountBoId}
                        placeholder={'Enter Account Bo Id'}
                        onChange={(event) => setAccountBoId(event.target.value)}
                    />
                    <div style={{ margin: '0.5em 0' }} />
                    <InputField
                        label={'Account Name'}
                        value={accountName}
                        placeholder={'Enter Account Name'}
                        onChange={(event) => setAccountName(event.target.value)}
                    />

                    <div style={{ margin: '0.5em 0' }} />
                    <Select
                        label={'Broker'}
                        selectedOption={brokerId}
                        options={brokerOption}
                        onSelectionChange={(event) => {
                            setBrokerId(event.value);
                        }}
                    />

                    <div style={{ margin: '0.5em 0' }} />
                    <InputField
                        label={'Client Id'}
                        value={accountClientId}
                        placeholder={'Enter Client Id'}
                        onChange={(event) => setAccountClientId(event.target.value)}
                    />

                    <p>Account Start Date</p>
                    <DateInput value={startDate} onChange={(event) => setStartDate(event.target.value)} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                setBrokerOption([]);
                                const account: DematAccount = {
                                    account_bo_id: accountBoId,
                                    account_name: accountName,
                                    account_client_id: accountClientId,
                                    broker: brokers[brokerId],
                                    start_date: parse(startDate, 'dd-MM-yyyy', new Date())
                                };
                                if (edit) {
                                } else {
                                    addStockAccount({ data: account }).then((apiResponse) => {
                                        onSubmit(true, apiResponse.results[0]);
                                    });
                                }
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddStockAccount;
