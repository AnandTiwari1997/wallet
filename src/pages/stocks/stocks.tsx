import CSS from 'csstype';
import { Fragment, useEffect, useRef, useState } from 'react';
import './stocks.css';
import { getStockAccount, syncInvestmentAccount } from '../../modules/backend/BackendApi';
import Tabs from '../../modules/tabs/tabs';
import Tab from '../../modules/tabs/tab';
import StockTransactionPage from './stocks-transaction';
import StockAccountPage from './stock-accounts';
import Select, { SelectOption } from '../../modules/select/select';
import Button from '../../modules/button/button';
import Dialog from '../../modules/dialog/dialog';
import AddStockAccount from './add-stock-account';
import { DematAccount } from '../../data/models';
import { useGlobalLoadingState } from '../../index';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

class StocksTab {
    static ACCOUNTS = {
        label: 'Accounts',
        value: 'demat_account'
    };
    static TRANSACTION = {
        label: 'Transaction',
        value: 'stock_transaction'
    };
}

const bodyStyle: CSS.Properties = {
    height: '100%',
    margin: '1%'
};

const StockPage = () => {
    const [selectedTab, setSelectedTab] = useState<string>(StocksTab.ACCOUNTS.value);
    const [showAddDematAccount, setShowAddDematAccount] = useState<boolean>(false);
    const [selectedAccount, setSelectedAccount] = useState<DematAccount | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [state, dispatch] = useGlobalLoadingState();
    const [accounts, setAccounts] = useState<DematAccount[]>([]);
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const [accountsMap, setAccountsMap] = useState<{ [key: string]: DematAccount }>({});
    const [filterAccount, setFilteredAccount] = useState('');
    const [filterTransactionType, setFilterTransactionType] = useState('');

    const switchTabs = (e: any, tab: string) => {
        setSelectedTab(tab);
    };

    useEffect(() => {
        getStockAccount({}, dispatch).then((apiResponse) => {
            setAccounts(apiResponse.results);
            let options = apiResponse.results.map((account) => {
                return {
                    value: account.account_bo_id,
                    label: account.account_name
                };
            });
            apiResponse.results.forEach((accounts) => {
                accountsMap[accounts.account_bo_id] = accounts;
                setAccountsMap({ ...accountsMap });
            });
            setSelectOptions([{ value: '', label: 'All' }, ...options]);
        });
    }, [setAccounts, getStockAccount]);

    const tabs: {
        label: string;
        value: string;
    }[] = [
        {
            label: StocksTab.ACCOUNTS.label,
            value: StocksTab.ACCOUNTS.value
        },
        {
            label: StocksTab.TRANSACTION.label,
            value: StocksTab.TRANSACTION.value
        }
    ];

    const handleRefresh = () => {
        const eventSource: EventSource = syncInvestmentAccount(selectedTab);
        eventSource.onmessage = (ev: MessageEvent) => {
            const jsonData = JSON.parse(ev.data);
            if (selectedTab === StocksTab.ACCOUNTS.value) eventSource.close();
            if (jsonData['type'] === 'ping') return;
            eventSource.close();
        };
    };

    return (
        <div style={topDiv}>
            <div style={bodyStyle}>
                <div className="stocks-action-body">
                    {selectedTab === StocksTab.TRANSACTION.value && (
                        <div
                            style={{
                                margin: '10px 0',
                                width: '300px'
                            }}
                        >
                            <p style={{ height: '20px', margin: '0' }}>Account: </p>
                            <Select selectedOption={filterAccount} onChange={(event) => setFilteredAccount(event.target.value)} options={selectOptions}></Select>
                        </div>
                    )}
                    {selectedTab === StocksTab.TRANSACTION.value && (
                        <div
                            style={{
                                margin: '10px 5px',
                                width: '300px'
                            }}
                        >
                            <p style={{ height: '20px', margin: '0' }}>Transaction Type: </p>
                            <Select
                                selectedOption={filterTransactionType}
                                onChange={(event) => setFilterTransactionType(event.target.value)}
                                options={[
                                    { value: '', label: 'All' },
                                    { value: 'B', label: 'Buy' },
                                    { value: 'S', label: 'Sell' }
                                ]}
                            ></Select>
                        </div>
                    )}
                    {selectedTab === StocksTab.ACCOUNTS.value && (
                        <div
                            style={{
                                height: 'calc(3rem - 10px)',
                                display: 'block',
                                marginTop: '30px',
                                marginRight: '1%',
                                float: 'right',
                                right: '0',
                                position: 'absolute'
                            }}
                        >
                            <Button
                                onClick={() => {
                                    setShowAddDematAccount(true);
                                }}
                            >
                                Add
                            </Button>
                        </div>
                    )}
                </div>
                <div className="stocks-tabs-body">
                    <div
                        style={{
                            height: '100%',
                            background: '#FFFFFF'
                        }}
                    >
                        <Fragment>
                            <div style={{ background: 'white', height: '100%' }}>
                                <Tabs selectedTab={selectedTab} onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}>
                                    <Tab label={StocksTab.ACCOUNTS.label} value={StocksTab.ACCOUNTS.value} classes={'tab--width'}>
                                        <StockAccountPage />
                                    </Tab>
                                    <Tab label={StocksTab.TRANSACTION.label} value={StocksTab.TRANSACTION.value} classes={'tab--width'}>
                                        <StockTransactionPage dematAccounts={accountsMap} filterByAccount={filterAccount} filterByTransactionType={filterTransactionType} />
                                    </Tab>
                                </Tabs>
                            </div>
                        </Fragment>
                    </div>
                </div>
            </div>
            <Dialog
                open={showAddDematAccount}
                onClose={() => {
                    setShowAddDematAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Demat Account"
            >
                <AddStockAccount account={selectedAccount} onSubmit={(success) => console.log(success)} />
            </Dialog>
        </div>
    );
};

export default StockPage;
