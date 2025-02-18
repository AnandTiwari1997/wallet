import 'pages/account/accounts.css';
import { ApiRequestBody, ApiResponse, getAccounts, syncAccount } from 'backend/BackendApi';
import CSS from 'csstype';
import { Account, AccountType } from 'data/models';
import { ArrayUtil } from 'data/transaction-data';
import useAPI from 'hooks/useAPI';
import useSnackbar from 'hooks/useSnackbar';
import { indianRupee, menu } from 'icons/icons';
import { Dialog, Icon, IconButton, Table, TableColumn } from 'modules';
import AddAccount from 'pages/account/add-account';
import { useEffect, useState } from 'react';
import FilterActionHeader from 'shared/filter-action-header/FilterActionHeader';
import { Menu, MenuOption } from 'boxed-material-ui';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    margin: '1%'
};

const AccountPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [count, setCount] = useState<number>(0);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
    const [getData, loading] = useAPI<ApiRequestBody<Account>, ApiResponse<Account>>(getAccounts);
    const [snackBarConfig, setSnackbarConfig] = useSnackbar();

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
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Account Balance:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Icon
                                className={'table-body-column-icon'}
                                icon={indianRupee}
                                svgProps={{
                                    height: '12px',
                                    width: '12px'
                                }}
                            />
                            {ArrayUtil.sum(rows, (row: Account) => row.account_balance).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Icon
                            className={'table-body-column-icon'}
                            icon={indianRupee}
                            svgProps={{
                                height: '12px',
                                width: '12px'
                            }}
                        />
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
                            svgProps={{
                                height: '16px',
                                width: '16px'
                            }}
                            id={`account-menu-${row.account_id}`}
                            icon={menu}
                            onClick={() => setSelectedAccount(row)}
                        />
                        <Menu
                            open={row.account_id === selectedAccount?.account_id && !showAddAccount}
                            onClose={() => {
                                setSelectedAccount(undefined);
                            }}
                            menuFor={`account-menu-${row.account_id}`}
                        >
                            <MenuOption
                                label={'Edit'}
                                onMenuOptionClick={(event) => {
                                    event.stopPropagation();
                                    setShowAddAccount(true);
                                    // setSelectedAccount(undefined);
                                }}
                            />
                            <MenuOption
                                label={'Sync'}
                                onMenuOptionClick={(event) => {
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
                                            setSnackbarConfig({
                                                open: true,
                                                message: `Sync has been started.`
                                            });
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
                <FilterActionHeader
                    actions={[
                        {
                            onClick: () => setShowAddAccount(true),
                            name: 'Add',
                            hidden: false
                        }
                    ]}
                />
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
                hideAction
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getData().then((response) => {
                                setCount(response.num_found);
                                setAccounts(response.results);
                            });
                            setSnackbarConfig({
                                open: true,
                                message: `Account ${data?.account_name} has been add Successfully.`
                            });
                        } else {
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
