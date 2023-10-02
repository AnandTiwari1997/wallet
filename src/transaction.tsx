import CalenderPicker from './modules/calender-picker/calender-picker';
import CSS from 'csstype';
import './transaction.css';
import { Transaction, ArrayUtil } from './data/transaction-data';
import { useEffect, useState } from 'react';
import { indianRupee } from './icons/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllTransactions } from './modules/backend/BackendApi';
import Table, { TableColumn } from './modules/table/table';
import { startOfYear } from 'date-fns/esm';
import { format } from 'date-fns';
import { darkGreen, darkRed } from './App';

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

    useEffect(() => {
        getAllTransactions({ from: startOfYear(new Date()), to: new Date() }).then((response) => {
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transactionDate);
            setInitialData([...sortedTransactions]);
        });
    }, [getAllTransactions, setInitialData]);

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
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            {row[0].account.accountName}
                        </div>
                    </div>
                );
            },
            customRender: (row: Transaction) => {
                return row.account.accountName;
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
            label: 'Note'
        },
        {
            key: 'labels',
            label: 'Labels',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Labels Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            {row[0].labels ? row[0].labels : 'None'}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'amount',
            label: 'Amount',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {row[0].amount}
                        </div>
                    </div>
                );
            },
            customRender: (row: Transaction) => {
                return (
                    <span style={{ color: row.amount > 0 ? `${darkGreen}` : `${darkRed}` }}>
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
                        getAllTransactions({ from: item.rangeStart, to: item.rangeEnd }).then((response) => {
                            console.log(`Total Transaction Found ${response.numFound}`);
                            const sortedTransactions = ArrayUtil.sort(
                                response.results,
                                (item: Transaction) => item.transactionDate
                            );
                            setInitialData([...sortedTransactions]);
                        });
                    }}
                    range={{ from: startOfYear(new Date()), to: new Date() }}
                />
            </div>
            <div style={bodyStyle}>
                <Table columns={columns} rows={initialData} groupByColumn={columns[0]} selectable={true} />
            </div>
        </div>
    );
};

export default TransactionPage;
