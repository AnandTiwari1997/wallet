import CSS from 'csstype';

import './accounts.css';
import { useEffect, useState } from 'react';

import AddAccount from './add-account';
import { ApiRequestBody } from '../../../backend/types/api-request-body';
import { Account, AccountType } from '../../data/models';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ArrayUtil } from '../../data/transaction-data';
import useAPI from '../../hooks/app-hooks';
import { indianRupee, menu } from '../../icons/icons';
import { ApiResponse, getAccounts, syncAccount } from '../../modules/backend/BackendApi';
import Button from '../../modules/button/button';
import Dialog from '../../modules/dialog/dialog';
import IconButton from '../../modules/icon/icon-button';
import Menu from '../../modules/menu/menu';
import MenuOption from '../../modules/menu/menu-option';
import Table, { TableColumn } from '../../modules/table/table';

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
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
    const [getData, loading] = useAPI<ApiRequestBody<Account>, ApiResponse<Account>>(getAccounts);

    useEffect(() => {
        getData().then((response) => {
            setCount(response.num_found);
            setAccounts(response.results);
        });
    }, [setAccounts, getAccounts]);

    const columns: TableColumn[] = [
        {
            key: 'account_type',
            label: 'Account Type',
            groupByKey: (row: Account) => {
                return AccountType.getLabel(row.account_type);
            }
        },
        {
            key: 'account_name',
            label: 'Account Name',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            {rows[0].account_name}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {row.bank && (
                            <i
                                className="icon"
                                style={{ width: 'fit-content' }}
                                dangerouslySetInnerHTML={{ __html: row.bank.icon }}
                            ></i>
                        )}
                        <div>{row.account_name}</div>
                    </div>
                );
            }
        },
        {
            key: 'account_number',
            label: 'Account Number',
            customRender: (row: Account) => {
                return (
                    <>
                        <div style={{}}>{row.account_number ? row.account_number : '--'}</div>
                    </>
                );
            }
        },
        {
            key: 'start_date',
            label: 'Start Date',
            customRender: (row: Account) => {
                return (
                    <>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'end'
                            }}
                        >
                            {new Date(row.start_date).toLocaleDateString()}
                        </div>
                    </>
                );
            }
        },
        {
            key: 'account_balance',
            label: 'Account Balance',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Account Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (row: Account) => row.account_balance).toFixed(2)}
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
                        {row.account_balance.toFixed(2)}
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
                        <IconButton
                            id={`account-menu-${row.account_id}`}
                            icon={menu}
                            onClick={() => {
                                setAccountMenuOptionFor(row.account_id);
                                setShowAccountMenu(true);
                                setSelectedAccount(row);
                            }}
                        />
                        <Menu
                            open={row.account_id === selectedAccount?.account_id}
                            onClose={() => {
                                setAccountMenuOptionFor(0);
                                setShowAccountMenu(false);
                                setSelectedAccount(undefined);
                            }}
                            menuFor={`account-menu-${accountMenuOptionFor}`}
                        >
                            <MenuOption
                                label={'Edit'}
                                onMenuOptionClick={(event) => {
                                    setShowAddAccount(true);
                                }}
                            />
                            <MenuOption
                                label={'Sync'}
                                onMenuOptionClick={(event) => {
                                    console.log(row);
                                    if (!selectedAccount) {
                                        return;
                                    }
                                    syncAccount({
                                        criteria: {
                                            filters: [
                                                {
                                                    key: 'account_type',
                                                    value: [selectedAccount.account_type.toString()]
                                                },
                                                { key: 'account_id', value: [selectedAccount.account_id.toString()] }
                                            ]
                                        }
                                    })
                                        .then((response) => {
                                            console.log(response.message);
                                        })
                                        .finally(() => setSelectedAccount(undefined));
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
                    <Button onClick={() => setShowAddAccount(true)}>Add</Button>
                </div>
                <div className="account-table-division">
                    <Table
                        columns={columns}
                        rows={accounts}
                        groupByColumn={[columns[0]]}
                        count={count}
                        isLoading={loading}
                    />
                </div>
            </div>
            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setShowAddAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Account"
                noAction
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getData().then((response) => {
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
