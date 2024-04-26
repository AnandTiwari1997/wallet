import Tabs from '../../modules/tabs/tabs';

import './bill.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CSS from 'csstype';
import { addMonths, format } from 'date-fns';
import { useEffect, useState } from 'react';

import AddBill from './add-bill';
import { ApiRequestBody } from '../../../backend/types/api-request-body';
import { Bill, billCategoryMap } from '../../data/models';
import { ArrayUtil } from '../../data/transaction-data';
import useAPI from '../../hooks/app-hooks';
import { indianRupee, menu } from '../../icons/icons';
import { ApiCriteria, ApiResponse, getBills, updateBill } from '../../modules/backend/BackendApi';
import Badge from '../../modules/badge/badge';
import Button from '../../modules/button/button';
import Dialog from '../../modules/dialog/dialog';
import IconButton from '../../modules/icon/icon-button';
import Menu from '../../modules/menu/menu';
import MenuOption from '../../modules/menu/menu-option';
import Table, { TableColumn, TableData } from '../../modules/table/table';
import Tab from '../../modules/tabs/tab';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const BillsPage = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [count, setCount] = useState<number>(0);
    const [selectedTab, setSelectedTab] = useState('ACTIVE');
    const [showAddBill, setShowAddBill] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | undefined>(undefined);
    const [showBillActionMenu, setShowBillActionMenu] = useState(false);
    const [billMenuOptionFor, setBillMenuOptionFor] = useState<string>('');
    const [dueBillsCount, setDueBillsCount] = useState<number>(0);
    const [getData, loading] = useAPI<ApiRequestBody<Bill>, ApiResponse<Bill>>(getBills);

    const VENDOR: TableColumn = {
        label: 'Vendor',
        key: 'vendor_name'
    };
    const NAME: TableColumn = {
        label: 'Bill Name',
        key: 'bill_name'
    };
    const STATUS: TableColumn = {
        label: 'Bill Status',
        key: 'bill_status',
        customRender: (row: Bill) => {
            return <>{row.bill_status} </>;
        }
    };
    const CATEGORY: TableColumn = {
        label: 'Bill Category',
        key: 'category',
        customRender: (row: Bill) => {
            return <>{billCategoryMap[row.category]}</>;
        }
    };
    const TRANSACTION_DATE: TableColumn = {
        label: 'Last Paid',
        key: 'last_transaction_date',
        customRender: (row: Bill) => {
            return <>{row.transaction_date ? format(new Date(row.transaction_date), 'dd MMM yyyy') : 'New'} </>;
        }
    };
    const LAST_BILL_DATE: TableColumn = {
        label: 'Last Billed Date',
        key: 'previous_bill_date',
        customRender: (row: Bill) => {
            return <>{format(new Date(row.previous_bill_date), 'dd MMM yyyy')}</>;
        }
    };
    const NEXT_BILL_DATE: TableColumn = {
        label: 'Billing Date',
        key: 'next_bill_date',
        customRender: (row: Bill) => {
            return <>{format(new Date(row.next_bill_date), 'dd MMM yyyy')}</>;
        }
    };
    const DUE_BILLS: TableColumn = {
        label: 'Due Bills',
        key: ''
    };
    const BILL_AMOUNT: TableColumn = {
        label: 'Amount',
        key: 'bill_amount',
        customRender: (row: Bill) => row.bill_amount.toFixed(2),
        columnFooter: (rows: TableData<Bill>[]) => {
            return (
                <div style={{ display: 'flex' }}>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'right',
                            fontWeight: '700'
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {ArrayUtil.sum(rows, (a: TableData<Bill>) =>
                            ArrayUtil.sum(a.data, (b: Bill) => (b.bill_status === 'UNPAID' ? b.bill_amount : 0))
                        ).toFixed(2)}
                    </div>
                </div>
            );
        }
    };
    const ACTION = {
        key: '',
        label: '',
        customRender: (row: Bill) => {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <IconButton
                        id={`account-menu-${row.bill_id}`}
                        icon={menu}
                        onClick={() => {
                            setBillMenuOptionFor(row.bill_id);
                            setSelectedBill(row);
                            setShowBillActionMenu(true);
                        }}
                    />
                    <Menu
                        open={row.bill_id === selectedBill?.bill_id}
                        onClose={() => {
                            setShowBillActionMenu(false);
                            setBillMenuOptionFor('');
                            setSelectedBill(undefined);
                        }}
                        menuFor={`account-menu-${billMenuOptionFor}`}
                    >
                        <MenuOption
                            label={'Edit'}
                            onMenuOptionClick={(event) => {
                                setShowAddBill(true);
                            }}
                        />
                        <MenuOption
                            label={'Paid'}
                            onMenuOptionClick={(event) => {
                                if (!selectedBill) {
                                    return;
                                }
                                if (selectedBill.bill_status === 'PAID') {
                                    return;
                                }
                                selectedBill.bill_status = 'PAID';
                                selectedBill.label = 'NON_ACTIVE';
                                selectedBill.transaction_date = new Date().toISOString();
                                selectedBill.previous_bill_date = selectedBill.next_bill_date;
                                selectedBill.next_bill_date = addMonths(
                                    new Date(selectedBill.previous_bill_date),
                                    1
                                ).toISOString();
                                updateBill({ data: selectedBill })
                                    .then((apiResponse) => {
                                        fetchBills();
                                        if (selectedTab === 'DUE') {
                                            getDueBillsCount();
                                        }
                                    })
                                    .finally(() => setSelectedBill(undefined));
                            }}
                        />
                        <MenuOption label={'Delete'} onMenuOptionClick={(event) => {}} />
                    </Menu>
                </div>
            );
        }
    };
    const BILL_CONSUMER_NO: TableColumn = {
        label: 'Consumer Number',
        key: 'bill_consumer_no'
    };

    const columnsPerTab: {
        [key: string]: TableColumn[];
    } = {
        ACTIVE: [VENDOR, NAME, BILL_CONSUMER_NO, CATEGORY, NEXT_BILL_DATE, ACTION],
        DUE: [VENDOR, NAME, BILL_CONSUMER_NO, CATEGORY, LAST_BILL_DATE, TRANSACTION_DATE, DUE_BILLS, ACTION],
        ALL: [VENDOR, NAME, BILL_CONSUMER_NO, CATEGORY, NEXT_BILL_DATE, TRANSACTION_DATE, STATUS, BILL_AMOUNT, ACTION]
    };

    const fetchBills = () => {
        let body: ApiRequestBody<Bill> = {
            criteria: {
                sorts: [{ key: 'next_bill_date', ascending: false }]
            }
        };
        if (selectedTab !== 'ALL') {
            const criteria = buildCriteria(selectedTab);
            body = { criteria: criteria };
        }
        getData(body).then((value) => {
            setBills(value.results);
            setCount(value.num_found);
        });
    };
    const getDueBillsCount = () => {
        const criteria = buildCriteria('DUE');
        const body: ApiRequestBody<Bill> = { criteria: criteria };
        getData(body).then((value) => {
            setDueBillsCount(value.num_found);
        });
    };

    useEffect(() => {
        fetchBills();
        getDueBillsCount();
    }, [selectedTab]);

    const buildCriteria = (label: string) => {
        const criteria: ApiCriteria = {
            filters: [
                {
                    key: 'label',
                    value: [label]
                }
            ],
            sorts: [{ key: 'next_bill_date', ascending: false }]
        };
        return criteria;
    };

    const _renderTabData = (tab: string) => {
        return (
            <Table
                columns={columnsPerTab[tab]}
                rows={bills}
                selectable={false}
                onSort={(sortedColumn) => console.log(sortedColumn)}
                onPagination={(tablePagination) => console.log(tablePagination)}
                count={count}
                isLoading={loading}
            />
        );
    };

    const _renderBadgedLabel = (count: number) => {
        return (
            <Badge badgeContent={count} anchorOrigin={{ vertical: 'center', horizontal: 'center' }}>
                Due Bills
            </Badge>
        );
    };

    return (
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
                <Button
                    onClick={() => {
                        setShowAddBill(true);
                        setSelectedBill(undefined);
                    }}
                >
                    Add
                </Button>
            </div>
            <div style={{ background: 'white', margin: '10px', height: 'calc(100% - 3rem - 20px)' }}>
                <Tabs selectedTab={selectedTab} onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}>
                    <Tab label={'Upcoming Bills'} value={'ACTIVE'} classes={'tab--width'}>
                        {_renderTabData('ACTIVE')}
                    </Tab>
                    <Tab label={_renderBadgedLabel(dueBillsCount)} value={'DUE'} classes={'tab--width'}>
                        {_renderTabData('DUE')}
                    </Tab>
                    <Tab label={'All Bills'} value={'ALL'} classes={'tab--width'}>
                        {_renderTabData('ALL')}
                    </Tab>
                </Tabs>
            </div>
            <Dialog
                open={showAddBill}
                onClose={() => {
                    setSelectedBill(undefined);
                    setShowAddBill(false);
                }}
                header="Bill"
            >
                <AddBill
                    bill={selectedBill}
                    onSubmit={(success, data) => {
                        if (success) {
                            fetchBills();
                            console.log(`Account ${data} has been add Successfully.`);
                        } else {
                            console.log(`Error occurred while adding Account ${data}.`);
                        }
                        setSelectedBill(undefined);
                        setShowAddBill(false);
                    }}
                />
            </Dialog>
        </div>
    );
};

export default BillsPage;
