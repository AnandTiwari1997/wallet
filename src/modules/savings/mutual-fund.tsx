import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { expand, expandAll, indianRupee, right } from '../../icons/icons';
import { ArrayUtil, MutualFundTransaction, ProvidentFundTransaction } from '../../data/transaction-data';
import { format } from 'date-fns/esm';
import { useEffect, useState } from 'react';
import { ApiRequestBody, ApiResponse, getInvestmentsTransaction } from '../backend/BackendApi';
import {
    collapseAllStyle,
    collapsedStyle,
    collapseStyle,
    expandedStyle,
    expandStyle,
    expenseStyle,
    incomeStyle,
    intermediateExpandStyle
} from '../../savings';
import Table, { TableColumn } from '../table/table';
import { darkGreen, darkRed } from '../../App';

const MutualFund = () => {
    const [initialData, setInitialData] = useState<MutualFundTransaction[]>([]);

    const buildCriteria = (
        filters: { key: string; value: string }[] = [],
        sorts: { key: string; ascending: boolean }[] = []
    ) => {
        return {
            filters: [...filters],
            sorts: [...sorts]
        };
    };

    const fetchInvestmentTransactions = (requestBody: ApiRequestBody<MutualFundTransaction>) => {
        getInvestmentsTransaction('mutual_fund', requestBody)
            .then((response: ApiResponse<any>) => {
                const formattedTransactions = ArrayUtil.map(response.results, (item: any) =>
                    MutualFundTransaction.build(item)
                );
                const sortedTransactions = ArrayUtil.sort(
                    formattedTransactions,
                    (item: MutualFundTransaction) => item.fundName
                );
                setInitialData(sortedTransactions);
            })
            .catch((reason) => {
                console.log(reason);
            });
    };

    useEffect(() => {
        fetchInvestmentTransactions({ criteria: buildCriteria([], [{ key: 'transactionDate', ascending: false }]) });
    }, [setInitialData]);

    const columns: TableColumn[] = [
        {
            key: 'fundName',
            label: 'Fund Name',
            groupByKey: (row: MutualFundTransaction) => row.fundName
        },
        {
            key: 'transactionDate',
            label: 'Transaction Date',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Transaction:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            {format(rows[0].transactionDate, 'dd MMM yyy')}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return format(row.transactionDate, 'dd MMM yyy');
            },
            sortable: true
        },
        {
            key: 'nav',
            label: 'NAV',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[rows.length - 1].latest_nav.toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.nav.toFixed(2)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'units',
            label: 'Unit',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            {ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.units).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span style={{ color: row.units > 0 ? `${darkGreen}` : `${darkRed}` }}>{row.units.toFixed(2)}</span>
                );
            },
            sortable: true
        },
        {
            key: 'amount',
            label: 'Invested Amount',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.amount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span style={{ color: row.amount > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.amount.toFixed(2)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'amount',
            label: 'Current Amount',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {(
                                ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.units) *
                                rows[rows.length - 1].latest_nav
                            ).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span style={{ color: row.units * row.latest_nav > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {(row.units * row.latest_nav).toFixed(2)}
                    </span>
                );
            },
            sortable: true
        }
    ];

    return (
        <Table
            columns={columns}
            rows={initialData}
            groupByColumn={columns[0]}
            onSort={(sortedColumn) => {
                if (!sortedColumn)
                    fetchInvestmentTransactions({
                        criteria: buildCriteria([], [{ key: 'transactionDate', ascending: false }])
                    });
                else
                    fetchInvestmentTransactions({
                        criteria: buildCriteria(
                            [],
                            [{ key: sortedColumn?.column.key, ascending: sortedColumn?.ascending }]
                        )
                    });
            }}
        />
    );
};

export default MutualFund;
