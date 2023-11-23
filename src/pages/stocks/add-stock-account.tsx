import Select, { SelectOption } from '../../modules/select/select';
import TextBox from '../../modules/text-box/text-box';
import { Broker, DematAccount } from '../../data/models';
import { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { addStockAccount, getBroker } from '../../modules/backend/BackendApi';
import { useGlobalLoadingState } from '../../index';

const AddStockAccount = ({ account, onSubmit }: { account?: DematAccount; onSubmit: (success: boolean, data: DematAccount | undefined) => any | void }) => {
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
    const [state, dispatch] = useGlobalLoadingState();

    const _getBrokers = () => {
        getBroker({}).then((apiResponse) => {
            let options: SelectOption[] = apiResponse.results
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
        setAccountType(account ? account.account_type : 'CASH');
        setAccountClientId(account ? account.account_client_id : '');
        setAccountName(account ? account.account_name : '');
        setStartDate(format(account ? new Date(account.start_date) : new Date(), 'dd-MM-yyyy'));
        setBrokerId(account ? (account.broker ? account.broker.broker_id : '') : '');
        _getBrokers();
    }, [account]);

    return (
        <>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'center' }}>
                <div>
                    <p style={{ margin: '0.5em 0' }}>Account BO Id</p>
                    <TextBox setValue={setAccountBoId} value={accountBoId} placeholder={'Enter Account Bo Id'} />
                    <p style={{ margin: '0.5em 0' }}>Account Name</p>
                    <TextBox setValue={setAccountName} value={accountName} placeholder={'Enter Account Name'} />

                    <p style={{ margin: '0.5em 0' }}>Broker</p>
                    <Select
                        selectedOption={brokerId}
                        options={brokerOption}
                        onChange={(event) => {
                            setBrokerId(event.target.value);
                        }}
                    />

                    <p style={{ margin: '0.5em 0' }}>Client Id</p>
                    <TextBox setValue={setAccountClientId} value={accountClientId} placeholder={'Enter Client Id'} />

                    <p>Account Start Date</p>
                    <TextBox setValue={setStartDate} value={startDate} placeholder={'Enter Loan Start Date in dd-MM-yyyy'} />

                    <div style={{ height: '40px', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <button
                            className="button"
                            onClick={() => {
                                setBrokerOption([]);
                                let account: DematAccount = {
                                    account_bo_id: accountBoId,
                                    account_name: accountName,
                                    account_client_id: accountClientId,
                                    account_type: accountType,
                                    broker: brokers[brokerId],
                                    start_date: parse(startDate, 'dd-MM-yyyy', new Date())
                                };
                                console.log(account);
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
