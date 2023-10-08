import CSS from 'csstype';
import './accounts.css';
import Table, { TableColumn } from './modules/table/table';
import { Account, accountData } from './data/account-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { indianRupee, menu } from './icons/icons';
import { useEffect, useState } from 'react';
import { getAccounts } from './modules/backend/BackendApi';
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
    const [accounts, setAccounts] = useState<Account[]>(accountData);
    const [count, setCount] = useState<number>(accountData.length);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [accountMenuOptionFor, setAccountMenuOptionFor] = useState<number>(0);
    const [state, dispatch] = useState();

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
                return row.accountType;
            }
        },
        {
            key: 'accountName',
            label: 'Account Name',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{rows[0].accountName}</div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {typeof row.bank === 'object' && <i className="icon" dangerouslySetInnerHTML={{ __html: row.bank.icon }}></i>}
                        <div>{row.accountName}</div>
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
                            {rows[0].initialBalance}
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
                        {row.initialBalance}
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
                            {rows[0].accountBalance}
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
                        {row.accountBalance}
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
                            id={`account-menu-${row.id}`}
                            onClick={() => {
                                setAccountMenuOptionFor(row.id);
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
                            <MenuOption label={'Edit'} />
                            <MenuOption label={'Sync'} />
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
            <Dialog open={showAddAccount} onClose={() => setShowAddAccount(false)} header="Account">
                <AddAccount
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
                        setShowAddAccount(false);
                    }}
                />
            </Dialog>
        </>
    );
};

export default AccountPage;
