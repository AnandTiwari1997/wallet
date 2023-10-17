import Tabs from '../../modules/tabs/tabs';
import Tab from '../../modules/tabs/tab';
import Table, { TableColumn } from '../../modules/table/table';
import './bill.css';
import { Bill, billCategoryMap } from '../../data/models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { menu } from '../../icons/icons';
import Menu from '../../modules/menu/menu';
import MenuOption from '../../modules/menu/menu-option';
import { ApiCriteria, getBills } from '../../modules/backend/BackendApi';
import CSS from 'csstype';
import Dialog from '../../modules/dialog/dialog';
import { useEffect, useState } from 'react';
import AddBill from './add-bill';
import { format } from 'date-fns';

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
    const [state, dispatch] = useState();
    const [showBillActionMenu, setShowBillActionMenu] = useState(false);
    const [billMenuOptionFor, setBillMenuOptionFor] = useState<string>('');

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
            return <>{row.transaction_date ? row.bill_status : 'New'} </>;
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
            return <>{row.transaction_date ? format(new Date(row.previous_bill_date), 'dd MMM yyyy') : 'New'} </>;
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
        customRender: (row: Bill) => row.bill_amount.toFixed(2)
    };
    const ACTION = {
        key: '',
        label: '',
        customRender: (row: Bill) => {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <button
                        className="icon-button"
                        id={`account-menu-${row.bill_id}`}
                        onClick={() => {
                            setBillMenuOptionFor(row.bill_id);
                            setSelectedBill(row);
                            setShowBillActionMenu(true);
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={menu} />
                        </i>
                    </button>
                    <Menu
                        open={showBillActionMenu}
                        onClose={() => {
                            setShowBillActionMenu(false);
                            setBillMenuOptionFor('');
                        }}
                        menuFor={`account-menu-${billMenuOptionFor}`}
                    >
                        <MenuOption
                            label={'Edit'}
                            onMenuOptionClick={(event) => {
                                setShowAddBill(true);
                            }}
                        />
                        <MenuOption label={'Delete'} onMenuOptionClick={(event) => {}} />
                    </Menu>
                </div>
            );
        }
    };

    const columnsPerTab: { [key: string]: TableColumn[] } = {
        ACTIVE: [VENDOR, NAME, CATEGORY, NEXT_BILL_DATE, ACTION],
        DUE: [VENDOR, NAME, CATEGORY, LAST_BILL_DATE, TRANSACTION_DATE, DUE_BILLS, ACTION],
        ALL: [VENDOR, NAME, CATEGORY, NEXT_BILL_DATE, TRANSACTION_DATE, STATUS, BILL_AMOUNT, ACTION]
    };

    const fetchBills = () => {
        let body = {};
        if (selectedTab !== 'ALL') {
            let criteria = buildCriteria(selectedTab);
            body = { criteria: criteria };
        }
        getBills(body, dispatch).then((value) => {
            setBills(value.results);
            setCount(value.num_found);
        });
    };

    useEffect(() => {
        fetchBills();
    }, [selectedTab]);

    const buildCriteria = (label: string) => {
        let criteria: ApiCriteria = {
            filters: [
                {
                    key: 'label',
                    value: label
                }
            ]
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
            />
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
                <button
                    className="button"
                    onClick={() => {
                        setShowAddBill(true);
                        setSelectedBill(undefined);
                    }}
                >
                    Add
                </button>
            </div>
            <div style={{ background: 'white', margin: '10px', height: 'calc(100% - 3rem - 20px)' }}>
                <Tabs selectedTab={'ACTIVE'} onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}>
                    <Tab label={'Upcoming Bills'} value={'ACTIVE'} classes={'tab--width'}>
                        {_renderTabData('ACTIVE')}
                    </Tab>
                    <Tab label={'Due Bills'} value={'DUE'} classes={'tab--width'}>
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
