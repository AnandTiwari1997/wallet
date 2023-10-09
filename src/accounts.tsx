import CSS from 'csstype';
import './accounts.css';
import Table, { TableColumn } from './modules/table/table';
import { Account } from './data/account-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { indianRupee, menu } from './icons/icons';
import { useEffect, useState } from 'react';
import { getAccounts, syncAccount } from './modules/backend/BackendApi';
import Dialog from './modules/dialog/dialog';
import Menu from './modules/menu/menu';
import MenuOption from './modules/menu/menu-option';
import AddAccount from './add-account';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const AccountPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [count, setCount] = useState<number>(0);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [accountMenuOptionFor, setAccountMenuOptionFor] = useState<number>(0);
    const [state, dispatch] = useState();
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);

    useEffect(() => {
        getAccounts(dispatch).then((response) => {
            setCount(response.num_found);
            setAccounts(response.results);
        });
    }, [setAccounts, getAccounts]);

    const columns: TableColumn[] = [
        {
            key: 'accountType',
            label: 'Account Type',
            groupByKey: (row: Account) => {
                return row.account_type;
            }
        },
        {
            key: 'accountName',
            label: 'Account Name',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{rows[0].account_name}</div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {row.bank && <i className="icon" dangerouslySetInnerHTML={{ __html: row.bank.icon }}></i>}
                        <div>{row.account_name}</div>
                    </div>
                );
            }
        },
        {
            key: 'initialBalance',
            label: 'Initial Balance',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Initial Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[0].initial_balance}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.initial_balance}
                    </div>
                );
            }
        },
        {
            key: 'accountBalance',
            label: 'Account Balance',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[0].account_balance}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.account_balance}
                    </div>
                );
            }
        },
        {
            key: '',
            label: '',
            customRender: (row: Account) => {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <button
                            className="icon-button"
                            id={`account-menu-${row.account_id}`}
                            onClick={() => {
                                setAccountMenuOptionFor(row.account_id);
                                setShowAccountMenu(true);
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={menu} />
                            </i>
                        </button>
                        <Menu
                            open={showAccountMenu}
                            onClose={() => {
                                setAccountMenuOptionFor(0);
                                setShowAccountMenu(false);
                            }}
                            menuFor={`account-menu-${accountMenuOptionFor}`}
                        >
                            <MenuOption
                                label={'Edit'}
                                onMenuOptionClick={(event) => {
                                    setSelectedAccount(row);
                                    setShowAddAccount(true);
                                }}
                            />
                            <MenuOption
                                label={'Sync'}
                                onMenuOptionClick={(event) => {
                                    syncAccount({
                                        criteria: {
                                            filters: [
                                                { key: 'account_type', value: 'BANK' },
                                                { key: 'account_id', value: row.account_id.toString() }
                                            ]
                                        }
                                    }).then((response) => {
                                        console.log(response.message);
                                    });
                                }}
                            />
                            <MenuOption label={'Delete'} />
                        </Menu>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <div style={topDiv}>
                <div
                    style={{
                        height: 'calc(3rem - 10px)',
                        display: 'flex',
                        justifyContent: 'end',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginRight: '10px'
                    }}
                >
                    <button className="button" onClick={() => setShowAddAccount(true)}>
                        Add
                    </button>
                </div>
                <div className="account-table-division">
                    <Table columns={columns} rows={accounts} groupByColumn={columns[0]} count={count} />
                </div>
            </div>
            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setShowAddAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Account"
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getAccounts(dispatch).then((response) => {
                                setCount(response.num_found);
                                setAccounts(response.results);
                            });
                            console.log(`Account ${data} has been add Successfully.`);
                        } else {
                            console.log(`Error occurred while adding Account ${data}.`);
                        }
                        setSelectedAccount(undefined);
                        setShowAddAccount(false);
                    }}
                />
            </Dialog>
        </>
    );
};

export default AccountPage;
