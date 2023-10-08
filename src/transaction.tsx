import CalenderPicker from './modules/calender-picker/calender-picker';
import CSS from 'csstype';
import './transaction.css';
import { ArrayUtil, Transaction, TransactionType } from './data/transaction-data';
import { useEffect, useState } from 'react';
import { indianRupee, view } from './icons/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllTransactions } from './modules/backend/BackendApi';
import Table, { TableColumn, TablePagination } from './modules/table/table';
import { startOfYear } from 'date-fns/esm';
import { format } from 'date-fns';
import { darkGreen, darkRed } from './App';
import Dialog from './modules/dialog/dialog';
import { useGlobalLoadingState } from './index';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const bodyStyle: CSS.Properties = {
    height: 'calc(100% - 6rem)',
    margin: '1%',
    background: '#FFFFFF'
};

const TransactionPage = () => {
    const [initialData, setInitialData] = useState<Transaction[]>([]);
    const [openDetailedView, setOpenDetailedView] = useState(false);
    const [detailedRow, setDetailedRow] = useState<Transaction | undefined>(undefined);
    const [count, setCount] = useState<number>(0);
    const [range, setRange] = useState<{ from: Date; to: Date }>({
        from: startOfYear(new Date()),
        to: new Date()
    });

    const [state, dispatch] = useGlobalLoadingState();

    const _getCriteria = (start: Date, end: Date, offset: number, limit: number) => {
        return {
            groupBy: [{ key: 'dated' }],
            sorts: [{ key: 'dated', ascending: false }],
            between: [
                {
                    key: 'transaction_date',
                    range: {
                        start: start.toISOString(),
                        end: end.toISOString()
                    }
                }
            ],
            offset: offset,
            limit: limit
        };
    };

    useEffect(() => {
        getAllTransactions(
            {
                criteria: _getCriteria(range.from, range.to, 0, 25)
            },
            dispatch
        ).then((response) => {
            setCount(response.num_found);
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transactionDate);
            setInitialData([...sortedTransactions]);
        });
    }, []);

    const columns: TableColumn[] = [
        {
            key: 'transactionDate',
            label: 'Transaction Date',
            groupByKey: (row: Transaction) => {
                return row.transactionDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                });
            },
            customRender: (row: Transaction) => format(row.transactionDate, 'dd MMMM yyy')
        },
        {
            key: 'account',
            label: 'Account',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{row[0].account}</div>
                    </div>
                );
            },
            customRender: (row: Transaction) => {
                return row.account;
            }
        },
        {
            key: 'category',
            label: 'Category',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Category Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{row[0].category}</div>
                    </div>
                );
            }
        },
        {
            key: 'note',
            label: 'Note',
            customRender: (row: Transaction) => {
                return (
                    <i
                        className="icon"
                        onClick={() => {
                            console.log(row);
                            setDetailedRow(row);
                            setOpenDetailedView(true);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={view} />
                    </i>
                );
            }
        },
        {
            key: 'labels',
            label: 'Labels',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Labels Used:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {row[0].labels ? row[0].labels : 'None'}
                        </div>
                    </div>
                );
            },
            customRender: (row: Transaction) => (row.labels ? row.labels : 'None')
        },
        {
            key: 'amount',
            label: 'Amount',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Expenditure:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(row, (item: Transaction) => {
                                if (item.transactionType === TransactionType.EXPENSE) return item.amount;
                                return 0;
                            }).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: Transaction) => {
                return (
                    <span
                        style={{
                            color: row.transactionType === TransactionType.INCOME ? `${darkGreen}` : `${darkRed}`
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.amount}
                    </span>
                );
            }
        }
    ];

    return (
        <div style={topDiv}>
            <div className="filter-header">
                <CalenderPicker
                    onChange={(item) => {
                        setRange({ from: item.rangeStart, to: item.rangeEnd });
                        getAllTransactions(
                            {
                                criteria: _getCriteria(item.rangeStart, item.rangeEnd, 0, 25)
                            },
                            dispatch
                        ).then((response) => {
                            setCount(response.num_found);
                            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transactionDate);
                            setInitialData([...sortedTransactions]);
                        });
                    }}
                    range={{ from: startOfYear(new Date()), to: new Date() }}
                />
            </div>
            <div style={bodyStyle}>
                <Table
                    columns={columns}
                    rows={initialData}
                    groupByColumn={columns[0]}
                    selectable={true}
                    count={count}
                    onPagination={(tablePagination: TablePagination) => {
                        getAllTransactions(
                            {
                                criteria: _getCriteria(range.from, range.to, tablePagination.pageNumber, tablePagination.pageSize)
                            },
                            dispatch
                        ).then((response) => {
                            setCount(response.num_found);
                            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transactionDate);
                            setInitialData([...sortedTransactions]);
                        });
                    }}
                />
                <Dialog
                    open={openDetailedView}
                    header={detailedRow?.transactionType === TransactionType.EXPENSE ? TransactionType.EXPENSE : TransactionType.INCOME}
                    onClose={() => {
                        setOpenDetailedView(false);
                        setDetailedRow(undefined);
                    }}
                >
                    <div>
                        <p>{detailedRow && detailedRow.note}</p>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default TransactionPage;
