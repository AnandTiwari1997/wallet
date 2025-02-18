import 'pages/bills/bill.css';
import { ApiCriteria, ApiRequestBody, ApiResponse, getBills, updateBill } from 'backend/BackendApi';
import { Badge } from 'boxed-material-ui/modules';
import CSS from 'csstype';
import { Bill, billCategoryMap } from 'data/models';
import { ArrayUtil } from 'data/transaction-data';
import { addMonths, format } from 'date-fns';
import useAPI from 'hooks/useAPI';
import useSnackbar from 'hooks/useSnackbar';
import { indianRupee, menu } from 'icons/icons';
import { Dialog, Icon, IconButton, Tab, Table, TableColumn, TableData, Tabs } from 'modules';
import AddBill from 'pages/bills/add-bill';
import { useCallback, useEffect, useState } from 'react';
import FilterActionHeader from 'shared/filter-action-header/FilterActionHeader';
import { Menu, MenuOption } from 'boxed-material-ui';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    margin: '1%'
};

const BillsPage = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [count, setCount] = useState<number>(0);
    const [selectedTab, setSelectedTab] = useState('ACTIVE');
    const [showAddBill, setShowAddBill] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | undefined>(undefined);
    const [dueBillsCount, setDueBillsCount] = useState<number>(0);
    const [getData, loading] = useAPI<ApiRequestBody<Bill>, ApiResponse<Bill>>(getBills);
    const [abortController, setAbortController] = useState<AbortController>(new AbortController());
    const [snackBarConfig, setSnackbarConfig] = useSnackbar();

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
                        <Icon
                            icon={indianRupee}
                            svgProps={{
                                height: '16px',
                                width: '16px'
                            }}
                        />
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
                        onClick={() => setSelectedBill(row)}
                        svgProps={{
                            height: '16px',
                            width: '16px'
                        }}
                    />
                    <Menu
                        open={row.bill_id === selectedBill?.bill_id && !showAddBill}
                        onClose={() => setSelectedBill(undefined)}
                        menuFor={`account-menu-${row.bill_id}`}
                    >
                        <MenuOption label={'Edit'} onMenuOptionClick={(event) => setShowAddBill(true)} />
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
                                        setSnackbarConfig({
                                            open: true,
                                            message: 'Bill marked paid.'
                                        });
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

    const fetchBills = useCallback(() => {
        let body: ApiRequestBody<Bill> = {
            criteria: {
                sorts: [{ key: 'next_bill_date', ascending: false }]
            }
        };
        if (selectedTab !== 'ALL') {
            const criteria = buildCriteria(selectedTab);
            body = { criteria: criteria };
        }
        getData(body, abortController).then((value) => {
            setBills(value.results);
            setCount(value.num_found);
        });
    }, [abortController, getData, selectedTab]);

    const getDueBillsCount = useCallback(() => {
        const criteria = buildCriteria('DUE');
        const body: ApiRequestBody<Bill> = { criteria: criteria };
        getData(body, abortController).then((value) => {
            setDueBillsCount(value.num_found);
        });
    }, [abortController, getData, selectedTab]);

    useEffect(() => {
        fetchBills();
        getDueBillsCount();
    }, []);

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
        return <Table columns={columnsPerTab[tab]} rows={bills} selectable={false} count={count} isLoading={loading} />;
    };

    const _renderBadgedLabel = (count: number) => {
        return (
            <Badge
                badgeContent={count}
                anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                childProps={{
                    label: {
                        style: {
                            position: 'relative',
                            marginLeft: '5px'
                        }
                    }
                }}
            >
                Due Bills
            </Badge>
        );
    };

    return (
        <div style={topDiv}>
            <FilterActionHeader
                actions={[
                    {
                        onClick: () => {
                            setShowAddBill(true);
                            setSelectedBill(undefined);
                        },
                        name: 'Add',
                        hidden: false
                    }
                ]}
            />
            <div style={{ background: 'white', height: 'calc(98% - 66px)' }}>
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
                hideAction
            >
                <AddBill
                    bill={selectedBill}
                    onSubmit={(success, data) => {
                        if (success) {
                            setAbortController(new AbortController());
                            fetchBills();
                            setSnackbarConfig({
                                open: true,
                                message: `Account ${data?.bill_consumer_no} has been add Successfully.`
                            });
                        } else {
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
