import { ApiRequestBody, ApiResponse, getStockAccount, syncStockAccount } from 'backend/BackendApi';
import CSS from 'csstype';
import { DematAccount } from 'data/models';
import useAPI from 'hooks/useAPI';
import { menu } from 'icons/icons';
import { Dialog, Icon, Snackbar, Table, TableColumn } from 'modules';
import AddStockAccount from 'pages/stocks/add-stock-account';
import { useEffect, useState } from 'react';
import { Menu, MenuOption } from 'boxed-material-ui';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const StockAccountPage = () => {
    const [accounts, setAccounts] = useState<DematAccount[]>([]);
    const [count, setCount] = useState<number>(0);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<DematAccount | undefined>(undefined);
    const [getData, loading] = useAPI<ApiRequestBody<DematAccount>, ApiResponse<DematAccount>>(getStockAccount);
    const [snackBarConfig, setSnackbarConfig] = useState<{
        open: boolean;
        message: string | null | undefined;
    }>({ open: false, message: '' });

    useEffect(() => {
        getData({}).then((apiResponse) => {
            setCount(apiResponse.num_found);
            setAccounts(apiResponse.results);
        });
    }, []);

    const columns: TableColumn[] = [
        {
            key: 'account_bo_id',
            label: 'BO Id'
        },
        {
            key: 'account_client_id',
            label: 'Client Id'
        },
        {
            key: 'account_name',
            label: 'Account Name'
        },
        {
            key: 'broker',
            label: 'Broker',
            customRender: (row: DematAccount) => {
                return (
                    <>
                        <div>{row.broker.broker_name}</div>
                    </>
                );
            }
        },
        {
            key: 'start_date',
            label: 'Start Date',
            customRender: (row: DematAccount) => {
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
            key: '',
            label: '',
            customRender: (row: DematAccount) => {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <button
                            className="icon-button"
                            id={`account-menu-${row.account_bo_id}`}
                            onClick={() => {
                                setSelectedAccount(row);
                            }}
                        >
                            <i className="icon">
                                <Icon
                                    icon={menu}
                                    svgProps={{
                                        height: '16px',
                                        width: '16px'
                                    }}
                                />
                            </i>
                        </button>
                        <Menu
                            open={row.account_bo_id === selectedAccount?.account_bo_id && !showAddAccount}
                            onClose={() => {
                                setSelectedAccount(undefined);
                            }}
                            menuFor={`account-menu-${row.account_bo_id}`}
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
                                    if (!selectedAccount) {
                                        return;
                                    }
                                    syncStockAccount({
                                        criteria: {
                                            filters: [{ key: 'account_bo_id', value: [selectedAccount.account_bo_id] }]
                                        }
                                    }).then((response) => {
                                        setSelectedAccount(undefined);
                                        setSnackbarConfig({
                                            open: true,
                                            message: response.message
                                        });
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
            <Snackbar
                open={snackBarConfig.open}
                onClose={() => {
                    setSnackbarConfig({ open: false, message: '' });
                }}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                }}
                autoCloseDuration={6000}
            >
                {snackBarConfig.message}
            </Snackbar>
            <Table columns={columns} rows={accounts} count={count} isLoading={loading} />
            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setSelectedAccount(undefined);
                    setShowAddAccount(false);
                }}
                header="Bill"
                hideAction
            >
                <AddStockAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        setSnackbarConfig({
                            open: true,
                            message: 'Demat Account Added Successfully'
                        });
                        getData({}).then((apiResponse) => {
                            setCount(apiResponse.num_found);
                            setAccounts(apiResponse.results);
                        });
                    }}
                />
            </Dialog>
        </>
    );
};

export default StockAccountPage;
