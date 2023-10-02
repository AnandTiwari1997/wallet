import { useEffect, useState } from 'react';
import { ArrayUtil, MutualFundTransaction, ProvidentFundTransaction } from '../../data/transaction-data';
import { ApiCriteria, ApiRequestBody, ApiResponse, getInvestmentsTransaction } from '../backend/BackendApi';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { expand, expandAll, indianRupee, right } from '../../icons/icons';
import { format } from 'date-fns/esm';
import Table, { TableColumn } from '../table/table';
import { darkGreen, darkRed } from '../../App';

const ProvidentFund = () => {
    const [initialData, setInitialData] = useState<ProvidentFundTransaction[]>([]);

    const buildCriteria = (
        filters: { key: string; value: string }[] = [],
        sorts: { key: string; ascending: boolean }[] = []
    ) => {
        return {
            filters: [...filters],
            sorts: [...sorts]
        };
    };

    const fetchInvestmentTransactions = (requestBody: ApiRequestBody<ProvidentFundTransaction>) => {
        getInvestmentsTransaction('provident_fund', requestBody)
            .then((response: ApiResponse<any>) => {
                const formattedTransactions: ProvidentFundTransaction[] = ArrayUtil.map(response.results, (item: any) =>
                    ProvidentFundTransaction.build(item)
                );
                const sortedTransactions = ArrayUtil.sort(
                    formattedTransactions,
                    (item: ProvidentFundTransaction) => item.financialYear
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
            key: 'financialYear',
            label: 'Financial Year',
            groupByKey: (row: ProvidentFundTransaction) => row.financialYear,
            sortable: false
        },
        {
            key: 'wageMonth',
            label: 'Salary Month',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Salary Month:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{rows[0].wageMonth}</div>
                    </div>
                );
            }
        },
        {
            key: 'transactionDate',
            label: 'Transaction Date',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
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
            }
        },
        {
            key: 'description',
            label: 'Description'
        },
        {
            key: 'employeeContribution',
            label: 'Employee Contribution',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (item) => item.employeeContribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.employeeContribution > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.employeeContribution.toFixed(2)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'employerContribution',
            label: 'Employer Contribution',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.employerContribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.employerContribution > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.employerContribution.toFixed(2)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'pensionAmount',
            label: 'Pension Amount',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.pensionAmount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.pensionAmount > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.pensionAmount.toFixed(2)}
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

export default ProvidentFund;
