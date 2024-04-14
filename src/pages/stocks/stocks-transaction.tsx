import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CSS from 'csstype';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { darkGreen, darkRed } from '../../App';
import { DematAccount, StockTransaction } from '../../data/models';
import { ArrayUtil } from '../../data/transaction-data';
import { indianRupee } from '../../icons/icons';
import { ApiCriteria, ApiResponse, getStockTransaction } from '../../modules/backend/BackendApi';
import Table, { TableColumn, TableData, TablePagination } from '../../modules/table/table';
import useAPI from '../../hooks/app-hooks';
import { ApiRequestBody } from '../../../backend/types/api-request-body';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const bodyStyle: CSS.Properties = {
    height: 'calc(100% - 6rem)'
    // margin: '1%'
};

export const collapsedStyle: CSS.Properties = {
    height: '0',
    visibility: 'hidden'
};

export const expandedStyle: CSS.Properties = {
    height: 'auto',
    visibility: 'visible'
};

export const expenseStyle: CSS.Properties = {
    color: '#e75757'
};

export const incomeStyle: CSS.Properties = {
    color: '#2e7d32'
};

export const intermediateExpandStyle: CSS.Properties = {
    transform: 'rotate(-90deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseAllStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const expandStyle: CSS.Properties = {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms ease 0s'
};

const StockTransactionPage = ({
    dematAccounts,
    filterByAccount,
    filterByTransactionType
}: {
    dematAccounts: { [key: string]: DematAccount };
    filterByAccount: string;
    filterByTransactionType: string;
}) => {
    const [initialData, setInitialData] = useState<StockTransaction[]>([]);
    const [count, setCount] = useState<number>(0);
    const [tablePagination, setTablePagination] = useState<TablePagination>({
        pageSize: 25,
        pageNumber: 0
    });
    const [getData, loading] = useAPI<ApiRequestBody<StockTransaction>, ApiResponse<StockTransaction>>(
        getStockTransaction
    );

    const _getCriteria = (offset: number, limit: number) => {
        const criteria: ApiCriteria = {
            groupBy: [{ key: 'holding_id' }],
            sorts: [{ key: 'holding_id', ascending: true }],
            offset: offset,
            limit: limit
        };
        const filters = [];
        if (filterByAccount !== '') {
            filters.push({ key: 'demat_account', value: [filterByAccount] });
        }
        if (filterByTransactionType !== '') {
            filters.push({ key: 'transaction_type', value: [filterByTransactionType] });
        }
        criteria.filters = filters;
        return criteria;
    };

    useEffect(() => {
        getData({ criteria: _getCriteria(tablePagination.pageNumber, tablePagination.pageSize) }).then(
            (apiResponse) => {
                setCount(apiResponse.num_found);
                const sortedTransactions = ArrayUtil.sort(
                    apiResponse.results,
                    (item: StockTransaction) => item.transaction_date
                );
                setInitialData(sortedTransactions);
            }
        );
    }, [tablePagination, filterByAccount, filterByTransactionType]);

    const columns: TableColumn[] = [
        {
            key: 'stock_name',
            label: 'Stock Name',
            groupByKey: (row: StockTransaction) => row.holding.stock_name,
            customRender: (row: StockTransaction) => row.holding.stock_name
        },
        {
            key: 'demat_account',
            label: 'Demat Account',
            groupByKey: (row: StockTransaction) => row.demat_account.account_name,
            customRender: (row: StockTransaction) => row.demat_account.account_name
        },
        {
            key: 'transaction_date',
            label: 'Transaction Date',
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Last Bought:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {format(
                                new Date(
                                    rows.find((value) => value.transaction_type === 'B')?.transaction_date || new Date()
                                ),
                                'dd MMMM yyy'
                            )}
                        </div>
                    </div>
                );
            },
            customRender: (row: StockTransaction) => format(new Date(row.transaction_date), 'dd MMMM yyy')
        },
        {
            key: 'transaction_type',
            label: 'Transaction Type',
            customRender: (row: StockTransaction) => (row.transaction_type === 'B' ? 'Buy' : 'Sell'),
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Last Transaction:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {rows[0].transaction_type === 'B' ? 'Buy' : 'Sell'}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'stock_quantity',
            label: 'Quantity',
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Shares:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {ArrayUtil.sum(rows, (item) => {
                                return item.transaction_type === 'B' ? item.stock_quantity : -1 * item.stock_quantity;
                            })}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'stock_transaction_price',
            label: 'Transaction Price',
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Current Price:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[0].holding.current_price.toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: StockTransaction) => {
                return (
                    <span>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.stock_transaction_price.toFixed(2)}
                    </span>
                );
            }
        },
        {
            key: '',
            label: 'Invested Amount',
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Invested:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {Number.parseFloat(rows[0].holding.invested_amount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: StockTransaction) => {
                return (
                    <span
                        style={{
                            color: row.transaction_type === 'B' ? `${darkGreen}` : `${darkRed}`
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {(row.stock_quantity * row.stock_transaction_price).toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<StockTransaction>[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Invested:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (item) =>
                                Number.parseFloat(item.data[0].holding.invested_amount)
                            ).toFixed(2)}
                        </div>
                    </div>
                );
            }
        },
        {
            key: '',
            label: 'Current Amount',
            groupByRender: (rows: StockTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Updated Amount:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                color:
                                    rows[0].amount <
                                    Number.parseInt(rows[0].holding.total_shares) * rows[0].holding.current_price
                                        ? `${darkGreen}`
                                        : `${darkRed}`
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {(Number.parseInt(rows[0].holding.total_shares) * rows[0].holding.current_price).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: StockTransaction) => {
                return (
                    <span>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.amount ? row.amount.toFixed(2) : 0}
                    </span>
                );
            },
            columnFooter: (rows: TableData<StockTransaction>[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Total Amount:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                color:
                                    ArrayUtil.sum(rows, (item) => item.data[0].amount) <
                                    ArrayUtil.sum(
                                        rows,
                                        (item) =>
                                            Number.parseInt(item.data[0].holding.total_shares) *
                                            item.data[0].holding.current_price
                                    )
                                        ? `${darkGreen}`
                                        : `${darkRed}`
                            }}
                        >
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(
                                rows,
                                (item) =>
                                    Number.parseInt(item.data[0].holding.total_shares) *
                                    item.data[0].holding.current_price
                            ).toFixed(2)}
                        </div>
                    </div>
                );
            }
        }
    ];

    return (
        <Table
            columns={columns}
            rows={initialData}
            groupByColumn={[columns[0], columns[1]]}
            selectable={true}
            count={count}
            isLoading={loading}
            onPagination={(tablePagination: TablePagination) => {
                setTablePagination(tablePagination);
            }}
        />
    );
};

export default StockTransactionPage;
