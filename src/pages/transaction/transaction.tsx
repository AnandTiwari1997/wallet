import CalenderPicker from 'boxed-material-ui/modules/CalenderPicker/CalenderPicker';
import 'pages/transaction/transaction.css';
import { darkGreen, darkRed } from 'App';
import {
    ApiCriteria,
    ApiRequestBody,
    ApiResponse,
    getAccounts,
    getAllTransactions,
    updateAccountTransaction
} from 'backend/BackendApi';
import CSS from 'csstype';
import { Account, Transaction } from 'data/models';
import { ArrayUtil, Category, TransactionType } from 'data/transaction-data';
import { format, startOfYear } from 'date-fns/esm';
import useAPI from 'hooks/useAPI';
import useSnackbar from 'hooks/useSnackbar';
import { close, edit, indianRupee, save, show } from 'icons/icons';
import { Chip, Dialog, Icon, Table, TableColumn, TableData, TablePagination } from 'modules';
import AddTransaction from 'pages/transaction/add-transaction';
import { useEffect, useState } from 'react';
import FilterActionHeader from 'shared/filter-action-header/FilterActionHeader';
import { Select, SelectOption } from 'boxed-material-ui';

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
    const [getData, loading] = useAPI<ApiRequestBody<Transaction>, ApiResponse<Transaction>>(getAllTransactions);
    const [snackBarConfig, setSnackbarConfig] = useSnackbar();

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
        const filters: any[] = [];
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
    }, []);

    useEffect(() => {
        getData({
            criteria: _getCriteria(range.from, range.to, tablePagination.pageNumber, tablePagination.pageSize)
        }).then((response: ApiResponse<Transaction>) => {
            setCount(response.num_found);
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transaction_date);
            setInitialData([...sortedTransactions]);
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                                                // eslint-disable-next-line no-param-reassign
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
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Category Used:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {Category.getLabel(row[0].category.toString())}
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
                                        width: '100%',
                                        textAlign: 'left',
                                        fontWeight: '700'
                                    }}
                                >
                                    {Category.getLabel(row.category.toString())}
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
                                        <Icon
                                            icon={edit}
                                            svgProps={{
                                                height: '12px',
                                                width: '12px'
                                            }}
                                        />
                                    </i>
                                </div>
                            </>
                        )}
                        {categoryUpdateRow?.transaction_id === row.transaction_id && (
                            <>
                                <div
                                    style={{
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    <Select
                                        size={'sm'}
                                        showLabel={false}
                                        spotClasses={{
                                            root: 'edit-category-select-root'
                                        }}
                                        selectedOption={category}
                                        options={Category.get()}
                                        onSelectionChange={(event) => {
                                            if (event) {
                                                if (categoryUpdateRow) {
                                                    // categoryUpdateRow.category = event.value;
                                                    setCategory(event.value);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '5px'
                                    }}
                                >
                                    <i
                                        className="icon"
                                        onClick={() => {
                                            if (categoryUpdateRow) {
                                                setCategoryUpdateRow(undefined);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Icon
                                            icon={close}
                                            svgProps={{
                                                height: '12px',
                                                width: '12px'
                                            }}
                                        />
                                    </i>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '5px'
                                    }}
                                >
                                    <i
                                        className="icon"
                                        onClick={() => {
                                            if (categoryUpdateRow) {
                                                categoryUpdateRow.category = category;
                                                updateAccountTransaction({ data: categoryUpdateRow }).then((value) => {
                                                    // eslint-disable-next-line no-param-reassign
                                                    row.category = value.results[0].category;
                                                    setCategoryUpdateRow(undefined);
                                                });
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Icon
                                            icon={save}
                                            svgProps={{
                                                height: '12px',
                                                width: '12px'
                                            }}
                                        />
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
                    <Icon
                        onClick={() => {
                            setDetailedRow(row);
                            setOpenDetailedView(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        icon={show}
                        svgProps={{
                            height: '12px',
                            width: '12px'
                        }}
                    />
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
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Expenditure:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'end',
                                alignItems: 'center'
                            }}
                        >
                            <i className="table-body-column-icon icon">
                                <Icon
                                    icon={indianRupee}
                                    svgProps={{
                                        height: '12px',
                                        width: '12px'
                                    }}
                                />
                            </i>
                            {ArrayUtil.sum(row, (item: Transaction) => {
                                if (item.transaction_type === TransactionType.EXPENSE.value) {
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
                            color:
                                row.transaction_type === TransactionType.INCOME.value ? `${darkGreen}` : `${darkRed}`,
                            display: 'flex',
                            justifyContent: 'end',
                            alignItems: 'center'
                        }}
                    >
                        <i className="table-body-column-icon icon">
                            <Icon
                                icon={indianRupee}
                                svgProps={{
                                    height: '12px',
                                    width: '12px'
                                }}
                            />
                        </i>
                        {row.amount.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<Transaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                                justifyContent: 'end',
                                fontWeight: '700',
                                alignItems: 'center'
                            }}
                        >
                            <i className="table-body-column-icon icon">
                                <Icon
                                    icon={indianRupee}
                                    svgProps={{
                                        height: '12px',
                                        width: '12px'
                                    }}
                                />
                            </i>
                            {ArrayUtil.sum(rows, (a: TableData<Transaction>) =>
                                ArrayUtil.sum(a.data, (b: Transaction) =>
                                    b.transaction_type === TransactionType.EXPENSE.value ? b.amount : 0
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
                <FilterActionHeader
                    filters={[
                        {
                            label: 'Account',
                            onSelectionChange: (event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setSelectedAccount(event.value);
                            },
                            options: selectOptions,
                            selectedOption: selectedAccount,
                            hidden: false,
                            loading: accounts.length === 0
                        },
                        {
                            label: 'Transaction Type',
                            onSelectionChange: (event) => {
                                setTablePagination({ pageSize: tablePagination.pageSize, pageNumber: 0 });
                                setTransactionType(event.value);
                            },
                            options: [{ value: '', label: 'All' }, TransactionType.INCOME, TransactionType.EXPENSE],
                            selectedOption: transactionType,
                            hidden: false
                        }
                    ]}
                    actions={[
                        {
                            onClick: (event) => setShowAddTransaction(true),
                            name: 'Add',
                            hidden: false
                        }
                    ]}
                />

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
                        detailedRow?.transaction_type === TransactionType.EXPENSE.value
                            ? TransactionType.EXPENSE.label
                            : TransactionType.INCOME.label
                    }
                    onClose={() => {
                        setOpenDetailedView(false);
                        setDetailedRow(undefined);
                    }}
                    hideAction
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
                <Dialog
                    open={showAddTransaction}
                    onClose={() => setShowAddTransaction(false)}
                    header={'Transaction'}
                    hideAction
                >
                    <AddTransaction
                        accounts={accounts}
                        onSubmit={(success: boolean, data: Transaction | undefined) => {
                            setShowAddTransaction(false);
                            setSnackbarConfig({
                                open: true,
                                message: `Transaction has been recorded.`
                            });
                            getData({
                                criteria: _getCriteria(
                                    range.from,
                                    range.to,
                                    tablePagination.pageNumber,
                                    tablePagination.pageSize
                                )
                            }).then((response: ApiResponse<Transaction>) => {
                                setCount(response.num_found);
                                const sortedTransactions = ArrayUtil.sort(
                                    response.results,
                                    (item: Transaction) => item.transaction_date
                                );
                                setInitialData([...sortedTransactions]);
                            });
                        }}
                    ></AddTransaction>
                </Dialog>
            </div>
        </div>
    );
};

export default TransactionPage;
