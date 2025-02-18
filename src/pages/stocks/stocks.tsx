import 'pages/stocks/stocks.css';
import { getStockAccount, syncInvestmentAccount } from 'backend/BackendApi';
import CSS from 'csstype';
import { DematAccount, StockTransaction, Transaction } from 'data/models';
import { Dialog, SelectOption, Tab, Tabs } from 'modules';
import AddStockAccount from 'pages/stocks/add-stock-account';
import AddStockTransaction from 'pages/stocks/add-stock-transaction';
import StockAccountPage from 'pages/stocks/stock-accounts';
import StockTransactionPage from 'pages/stocks/stocks-transaction';
import { Fragment, useEffect, useRef, useState } from 'react';
import FilterActionHeader from 'shared/filter-action-header/FilterActionHeader';

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
    const [accounts, setAccounts] = useState<DematAccount[]>([]);
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const [accountsMap, setAccountsMap] = useState<{
        [key: string]: DematAccount;
    }>({});
    const [filterAccount, setFilteredAccount] = useState('');
    const [filterTransactionType, setFilterTransactionType] = useState('');
    const [showAddStockTransaction, setShowAddStockTransaction] = useState<boolean>(false);

    const switchTabs = (e: any, tab: string) => {
        setSelectedTab(tab);
    };

    useEffect(() => {
        getStockAccount({}).then((apiResponse) => {
            setAccounts(apiResponse.results);
            const options = apiResponse.results.map((account) => {
                return {
                    value: account.account_bo_id,
                    label: account.account_name
                };
            });
            apiResponse.results.forEach((accounts) => {
                accountsMap[accounts.account_bo_id] = accounts;
                setAccountsMap({ ...accountsMap });
            });
            setSelectOptions([...options]);
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
            if (selectedTab === StocksTab.ACCOUNTS.value) {
                eventSource.close();
            }
            if (jsonData.type === 'ping') {
                return;
            }
            eventSource.close();
        };
    };

    return (
        <div style={topDiv}>
            <div style={bodyStyle}>
                <FilterActionHeader
                    filters={[
                        {
                            label: 'Account',
                            onSelectionChange: (event) => setFilteredAccount(event.value),
                            options: [{ value: '', label: 'All' }, ...selectOptions],
                            selectedOption: filterAccount,
                            hidden: selectedTab !== StocksTab.TRANSACTION.value
                        },
                        {
                            label: 'Transaction Type',
                            onSelectionChange: (event) => setFilterTransactionType(event.value),
                            options: [
                                { value: '', label: 'All' },
                                { value: 'B', label: 'Buy' },
                                { value: 'S', label: 'Sell' }
                            ],
                            selectedOption: filterTransactionType,
                            hidden: selectedTab !== StocksTab.TRANSACTION.value
                        }
                    ]}
                    actions={[
                        {
                            onClick: (event) => setShowAddStockTransaction(true),
                            name: 'Add',
                            hidden: selectedTab !== StocksTab.TRANSACTION.value
                        },
                        {
                            onClick: (event) => setShowAddDematAccount(true),
                            name: 'Add',
                            hidden: selectedTab === StocksTab.TRANSACTION.value
                        }
                    ]}
                />
                <div className="stocks-tabs-body">
                    <div
                        style={{
                            height: '100%',
                            background: '#FFFFFF'
                        }}
                    >
                        <Fragment>
                            <div style={{ background: 'white', height: '100%' }}>
                                <Tabs
                                    selectedTab={selectedTab}
                                    onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}
                                >
                                    <Tab
                                        label={StocksTab.ACCOUNTS.label}
                                        value={StocksTab.ACCOUNTS.value}
                                        classes={'tab--width'}
                                    >
                                        <StockAccountPage />
                                    </Tab>
                                    <Tab
                                        label={StocksTab.TRANSACTION.label}
                                        value={StocksTab.TRANSACTION.value}
                                        classes={'tab--width'}
                                    >
                                        <StockTransactionPage
                                            dematAccounts={accountsMap}
                                            filterByAccount={filterAccount}
                                            filterByTransactionType={filterTransactionType}
                                        />
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
                <AddStockAccount
                    account={selectedAccount}
                    onSubmit={(success: boolean, data: DematAccount | undefined) => {
                        setShowAddDematAccount(false);
                    }}
                />
            </Dialog>
            <Dialog
                open={showAddStockTransaction}
                onClose={() => {
                    setShowAddStockTransaction(false);
                }}
                header="Stock Transaction"
            >
                <AddStockTransaction
                    accountMap={accountsMap}
                    accountOptions={selectOptions}
                    onSubmit={(success: boolean, data: StockTransaction | undefined) => {
                        setShowAddStockTransaction(false);
                    }}
                />
            </Dialog>
        </div>
    );
};

export default StockPage;
