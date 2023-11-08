import CalenderPicker from '../../modules/calender-picker/calender-picker';
import CSS from 'csstype';
import './transaction.css';
import { ArrayUtil, Category, TransactionType } from '../../data/transaction-data';
import { useEffect, useState } from 'react';
import { indianRupee, view } from '../../icons/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ApiCriteria, getAccounts, getAllTransactions } from '../../modules/backend/BackendApi';
import Table, { TableColumn, TablePagination } from '../../modules/table/table';
import { startOfYear } from 'date-fns/esm';
import { format } from 'date-fns';
import { darkGreen, darkRed } from '../../App';
import Dialog from '../../modules/dialog/dialog';
import { useGlobalLoadingState } from '../../index';
import { Account, Transaction } from '../../data/models';
import Select, { SelectOption } from '../../modules/select/select';
import Button from '../../modules/button/button';
import AddTransaction from './add-transaction';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const bodyStyle: CSS.Properties = {
    height: 'calc(100% - 6rem)',
    margin: '1%'
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
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const [tablePagination, setTablePagination] = useState<TablePagination>({
        pageSize: 25,
        pageNumber: 0
    });
    const [transactionType, setTransactionType] = useState('');
    const [showAddTransaction, setShowAddTransaction] = useState(false);

    const [state, dispatch] = useGlobalLoadingState();

    const _getCriteria = (start: Date, end: Date, offset: number, limit: number) => {
        let criteria: ApiCriteria = {
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
        let filters = [];
        if (selectedAccount !== '') {
            filters.push({ key: 'account', value: selectedAccount });
        }
        if (transactionType !== '') {
            filters.push({ key: 'transaction_type', value: transactionType });
        }
        criteria.filters = filters;
        return criteria;
    };

    useEffect(() => {
        getAllTransactions(
            {
                criteria: _getCriteria(range.from, range.to, tablePagination.pageNumber, tablePagination.pageSize)
            },
            dispatch
        ).then((response) => {
            setCount(response.num_found);
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transaction_date);
            setInitialData([...sortedTransactions]);
        });
        getAccounts(dispatch).then((response) => {
            setAccounts(response.results);
            let options = response.results.map((account) => {
                return {
                    value: account.account_id,
                    label: account.account_name
                };
            });
            setSelectOptions([{ value: '', label: 'All' }, ...options]);
        });
    }, [selectedAccount, tablePagination, range, transactionType]);

    const columns: TableColumn[] = [
        {
            key: 'transactionDate',
            label: 'Transaction Date',
            groupByKey: (row: Transaction) => {
                return new Date(row.transaction_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                });
            },
            customRender: (row: Transaction) => format(new Date(row.transaction_date), 'dd MMMM yyy')
        },
        {
            key: 'account',
            label: 'Account',
            groupByRender: (rows: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Most Used Account:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {
                                accounts.find((value) => {
                                    return (
                                        value.account_id ===
                                        ArrayUtil.max<{
                                            account_id: number;
                                            count: number;
                                        }>(
                                            ArrayUtil.freq<
                                                Transaction,
                                                {
                                                    account_id: number;
                                                    count: number;
                                                }
                                            >(rows, (previousValue, currentValue) => {
                                                let accountFreqMap = previousValue[currentValue.account.account_id] || {
                                                    account_id: currentValue.account.account_id,
                                                    count: 0
                                                };
                                                previousValue[currentValue.account.account_id] = {
                                                    account_id: currentValue.account.account_id,
                                                    count: accountFreqMap.count + 1
                                                };
                                                return previousValue;
                                            }),
                                            (item) => item.count
                                        ).account_id
                                    );
                                })?.account_name
                            }
                        </div>
                    </div>
                );
            },
            customRender: (row: Transaction) => {
                return row.account.account_name;
            }
        },
        {
            key: 'category',
            label: 'Category',
            groupByRender: (row: Transaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Category Used:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {row[0].category.toString()}
                        </div>
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
                                if (item.transaction_type === TransactionType.EXPENSE.label) return item.amount;
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
                            color: row.transaction_type === TransactionType.INCOME.label ? `${darkGreen}` : `${darkRed}`
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.amount.toFixed(2)}
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
                        setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                        setRange({ from: item.rangeStart, to: item.rangeEnd });
                    }}
                    range={{ from: startOfYear(new Date()), to: new Date() }}
                />
            </div>
            <div style={bodyStyle}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                >
                    <div
                        style={{
                            margin: '10px 0',
                            width: '300px'
                        }}
                    >
                        <p style={{ height: '20px', margin: '0' }}>Account: </p>
                        <Select
                            selectedOption={selectedAccount}
                            onChange={(event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setSelectedAccount(event.target.value);
                            }}
                            options={selectOptions}
                        ></Select>
                    </div>
                    <div
                        style={{
                            margin: '10px 5px',
                            width: '300px'
                        }}
                    >
                        <p style={{ height: '20px', margin: '0' }}>Transaction Type: </p>
                        <Select
                            selectedOption={transactionType}
                            onChange={(event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setTransactionType(event.target.value);
                            }}
                            options={[{ value: '', label: 'All' }, TransactionType.INCOME, TransactionType.EXPENSE]}
                        ></Select>
                    </div>
                    <div
                        style={{
                            height: 'calc(3rem - 10px)',
                            display: 'block',
                            marginTop: '30px',
                            marginRight: '1%',
                            float: 'right',
                            right: '0',
                            position: 'absolute'
                        }}
                    >
                        <Button
                            onClick={() => {
                                setShowAddTransaction(true);
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                <div
                    style={{
                        height: 'calc(100% - 76px)',
                        background: '#FFFFFF'
                    }}
                >
                    <Table
                        columns={columns}
                        rows={initialData}
                        groupByColumn={columns[0]}
                        selectable={true}
                        count={count}
                        onPagination={(tablePagination: TablePagination) => {
                            setTablePagination(tablePagination);
                        }}
                    />
                </div>
                <Dialog
                    open={openDetailedView}
                    header={detailedRow?.transaction_type === TransactionType.EXPENSE.label ? TransactionType.EXPENSE.label : TransactionType.INCOME.label}
                    onClose={() => {
                        setOpenDetailedView(false);
                        setDetailedRow(undefined);
                    }}
                >
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '10px' }}>Amount</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>{detailedRow && JSON.parse(detailedRow.note)['transactionAmount']}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Account</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>{detailedRow && JSON.parse(detailedRow.note)['transactionAccount']}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Information</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>{detailedRow && JSON.parse(detailedRow.note)['transactionInfo']}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Date</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>{detailedRow && JSON.parse(detailedRow.note)['transactionDate']}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Dialog>
                <Dialog open={showAddTransaction} onClose={() => setShowAddTransaction(false)} header={'Transaction'}>
                    <AddTransaction accounts={accounts}></AddTransaction>
                </Dialog>
            </div>
        </div>
    );
};

export default TransactionPage;
