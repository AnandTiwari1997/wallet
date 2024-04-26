import CalenderPicker from '../../modules/calender-picker/calender-picker';

import CSS from 'csstype';

import './transaction.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, startOfYear } from 'date-fns/esm';
import { useEffect, useState } from 'react';

import AddTransaction from './add-transaction';
import useAPI from '../../hooks/app-hooks';
import { AccountTransaction } from '../../../backend/database/models/account-transaction';
import { ApiRequestBody } from '../../../backend/types/api-request-body';
import { darkGreen, darkRed } from '../../App';
import { Account, Transaction } from '../../data/models';
import { ArrayUtil, Category, TransactionType } from '../../data/transaction-data';
import { edit, indianRupee, save, show } from '../../icons/icons';
import {
    ApiCriteria,
    ApiResponse,
    getAccounts,
    getAllTransactions,
    updateAccountTransaction
} from '../../modules/backend/BackendApi';
import Button from '../../modules/button/button';
import Chip from '../../modules/chips/chip';
import Dialog from '../../modules/dialog/dialog';
import Select, { SelectOption } from '../../modules/select/select';
import Table, { TableColumn, TableData, TablePagination } from '../../modules/table/table';

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
    const [range, setRange] = useState<{
        from: Date;
        to: Date;
    }>({
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
    const [category, setCategory] = useState<string>('');
    const [categoryUpdateRow, setCategoryUpdateRow] = useState<Transaction | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [getData, loading] = useAPI<ApiRequestBody<AccountTransaction>, ApiResponse<Transaction>>(getAllTransactions);

    const _getCriteria = (start: Date, end: Date, offset: number, limit: number) => {
        const criteria: ApiCriteria = {
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
        const filters = [];
        if (selectedAccount !== '') {
            filters.push({ key: 'account', value: [selectedAccount] });
        }
        if (transactionType !== '') {
            filters.push({ key: 'transaction_type', value: [transactionType] });
        }
        if (selectedCategory !== '') {
            filters.push({ key: 'category', value: [selectedCategory] });
        }
        criteria.filters = filters;
        return criteria;
    };

    useEffect(() => {
        getData({
            criteria: _getCriteria(range.from, range.to, tablePagination.pageNumber, tablePagination.pageSize)
        }).then((response: ApiResponse<Transaction>) => {
            setCount(response.num_found);
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transaction_date);
            setInitialData([...sortedTransactions]);
        });
        getAccounts().then((response) => {
            setAccounts(response.results);
            const options = response.results.map((account) => {
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
            groupByRender: (row: Transaction[]) => {
                return `${new Date(row[0].transaction_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric'
                })} (${row.length})`;
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
                                                const accountFreqMap = previousValue[
                                                    currentValue.account.account_id
                                                ] || {
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
            },
            customRender: (row: Transaction) => {
                return (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%'
                        }}
                    >
                        {!(categoryUpdateRow?.transaction_id === row.transaction_id) && (
                            <>
                                <div
                                    style={{
                                        width: '80%',
                                        textAlign: 'left',
                                        fontWeight: '700'
                                    }}
                                >
                                    {row.category.toString()}
                                </div>
                                <div>
                                    <i
                                        className="icon"
                                        onClick={() => {
                                            setCategory(row.category.toString());
                                            setCategoryUpdateRow(row);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon icon={edit} />
                                    </i>
                                </div>
                            </>
                        )}
                        {categoryUpdateRow?.transaction_id === row.transaction_id && (
                            <>
                                <div
                                    style={{
                                        width: '80%',
                                        textAlign: 'left',
                                        fontWeight: '700'
                                    }}
                                >
                                    <Select
                                        style={{
                                            minWidth: 'unset'
                                        }}
                                        selectedOption={category}
                                        options={Category.get()}
                                        onSelectionChange={(event) => {
                                            if (event) {
                                                if (categoryUpdateRow) {
                                                    categoryUpdateRow.category = event.value;
                                                    setCategory(categoryUpdateRow.category.toString());
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '20%',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i
                                        className="icon"
                                        onClick={() => {
                                            if (categoryUpdateRow) {
                                                categoryUpdateRow.category = category;
                                                updateAccountTransaction({ data: categoryUpdateRow }).then((value) => {
                                                    row.category = value.results[0].category;
                                                    setCategoryUpdateRow(undefined);
                                                });
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon icon={save} />
                                    </i>
                                </div>
                            </>
                        )}
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
                            setDetailedRow(row);
                            setOpenDetailedView(true);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={show} />
                    </i>
                );
            }
        },
        {
            key: 'labels',
            label: 'Labels',
            customRender: (row: Transaction) => {
                return (
                    <>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left'
                            }}
                        >
                            {row.labels.map((value) => {
                                return <Chip label={value} variant={'outline'} />;
                            })}
                        </div>
                    </>
                );
            }
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
                                if (item.transaction_type === TransactionType.EXPENSE.label) {
                                    return item.amount;
                                }
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
            },
            columnFooter: (rows: TableData<Transaction>[]) => {
                return (
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                width: '100%',
                                justifyContent: 'right'
                            }}
                        >{`Total Expenditure:`}</div>
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
                            {ArrayUtil.sum(rows, (a: TableData<Transaction>) =>
                                ArrayUtil.sum(a.data, (b: Transaction) =>
                                    b.transaction_type === TransactionType.EXPENSE.label ? b.amount : 0
                                )
                            ).toFixed(2)}
                        </div>
                    </div>
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
                            onSelectionChange={(event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setSelectedAccount(event.value);
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
                            onSelectionChange={(event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setTransactionType(event.value);
                            }}
                            options={[{ value: '', label: 'All' }, TransactionType.INCOME, TransactionType.EXPENSE]}
                        ></Select>
                    </div>
                    {/*<div*/}
                    {/*    style={{*/}
                    {/*        margin: '10px 5px',*/}
                    {/*        width: '300px'*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <p style={{ height: '20px', margin: '0' }}>Category Type: </p>*/}
                    {/*    <Select*/}
                    {/*        selectedOption={selectedCategory}*/}
                    {/*        onChange={(event) => {*/}
                    {/*            setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });*/}
                    {/*            setSelectedCategory(event.target.value);*/}
                    {/*        }}*/}
                    {/*        options={Category.get()}*/}
                    {/*    ></Select>*/}
                    {/*</div>*/}
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
                        groupByColumn={[columns[0]]}
                        selectable={true}
                        count={count}
                        onPagination={(tablePagination: TablePagination) => {
                            setTablePagination(tablePagination);
                        }}
                        isLoading={loading}
                    />
                </div>
                <Dialog
                    open={openDetailedView}
                    header={
                        detailedRow?.transaction_type === TransactionType.EXPENSE.label
                            ? TransactionType.EXPENSE.label
                            : TransactionType.INCOME.label
                    }
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
                                    <td style={{ padding: '10px' }}>
                                        {detailedRow && JSON.parse(detailedRow.note).transactionAmount}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Account</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>
                                        {detailedRow && JSON.parse(detailedRow.note).transactionAccount}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Information</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>
                                        {detailedRow && JSON.parse(detailedRow.note).transactionInfo}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px' }}>Date</td>
                                    <td>:</td>
                                    <td style={{ padding: '10px' }}>
                                        {detailedRow && JSON.parse(detailedRow.note).transactionDate}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Dialog>
                <Dialog open={showAddTransaction} onClose={() => setShowAddTransaction(false)} header={'Transaction'}>
                    <AddTransaction
                        accounts={accounts}
                        onSubmit={(success: boolean, data: Transaction | undefined) => {
                            setShowAddTransaction(false);
                            console.log(success);
                            console.log(data);
                        }}
                    ></AddTransaction>
                </Dialog>
            </div>
        </div>
    );
};

export default TransactionPage;
