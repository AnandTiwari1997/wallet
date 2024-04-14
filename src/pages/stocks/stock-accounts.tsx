import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CSS from 'csstype';
import { useEffect, useState } from 'react';

import { DematAccount } from '../../data/models';
import { menu } from '../../icons/icons';
import { ApiResponse, getStockAccount, syncAccount } from '../../modules/backend/BackendApi';
import Menu from '../../modules/menu/menu';
import MenuOption from '../../modules/menu/menu-option';
import Table, { TableColumn } from '../../modules/table/table';
import useAPI from '../../hooks/app-hooks';
import { ApiRequestBody } from '../../../backend/types/api-request-body';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const StockAccountPage = () => {
    const [accounts, setAccounts] = useState<DematAccount[]>([]);
    const [count, setCount] = useState<number>(0);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [accountMenuOptionFor, setAccountMenuOptionFor] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<DematAccount | undefined>(undefined);
    const [getData, loading] = useAPI<ApiRequestBody<DematAccount>, ApiResponse<DematAccount>>(getStockAccount);

    useEffect(() => {
        getData({}).then((apiResponse) => {
            setCount(apiResponse.num_found);
            setAccounts(apiResponse.results);
        });
    }, [setAccounts, getStockAccount]);

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
                        <div style={{}}>{row.broker.broker_name}</div>
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
                                setAccountMenuOptionFor(row.account_bo_id);
                                setShowAccountMenu(true);
                                setSelectedAccount(row);
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={menu} />
                            </i>
                        </button>
                        <Menu
                            open={showAccountMenu}
                            onClose={() => {
                                setAccountMenuOptionFor('');
                                setShowAccountMenu(false);
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
                                                { key: 'account_id', value: [selectedAccount.account_bo_id.toString()] }
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
            <Table columns={columns} rows={accounts} count={count} isLoading={loading} />
        </>
    );
};

export default StockAccountPage;
