import { useEffect, useState } from 'react';
import { ArrayUtil } from '../../data/transaction-data';
import { ApiRequestBody, ApiResponse, getInvestmentsTransaction } from '../../modules/backend/BackendApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { indianRupee } from '../../icons/icons';
import { format } from 'date-fns/esm';
import Table, { TableColumn, TableData } from '../../modules/table/table';
import { darkGreen, darkRed } from '../../App';
import { useGlobalLoadingState } from '../../index';
import { ProvidentFundTransaction } from '../../data/models';

const ProvidentFund = () => {
    const [initialData, setInitialData] = useState<ProvidentFundTransaction[]>([]);
    const [count, setCount] = useState<number>(0);
    const [state, dispatch] = useGlobalLoadingState();

    const buildCriteria = (
        filters: { key: string; value: string }[] = [],
        sorts: {
            key: string;
            ascending: boolean;
        }[] = []
    ) => {
        return {
            filters: [...filters],
            sorts: [...sorts],
            groupBy: [{ key: 'financial_year' }],
            offset: 0,
            limit: 25
        };
    };

    const fetchInvestmentTransactions = (requestBody: ApiRequestBody<ProvidentFundTransaction>) => {
        getInvestmentsTransaction('provident_fund', requestBody, dispatch)
            .then((response: ApiResponse<any>) => {
                setCount(response.num_found);
                // const formattedTransactions: ProvidentFundTransaction[] = ArrayUtil.map(response.results, (item: any) => ProvidentFundTransaction.build(item));
                const sortedTransactions = ArrayUtil.sort(response.results, (item: ProvidentFundTransaction) => item.financial_year);
                setInitialData(sortedTransactions);
            })
            .catch((reason) => {
                console.log(reason);
            });
    };

    useEffect(() => {
        fetchInvestmentTransactions({ criteria: buildCriteria([], [{ key: 'transaction_date', ascending: false }]) });
    }, [setInitialData]);

    const columns: TableColumn[] = [
        {
            key: 'financial_year',
            label: 'Financial Year',
            groupByKey: (row: ProvidentFundTransaction) => row.financial_year,
            sortable: false
        },
        {
            key: 'wage_month',
            label: 'Salary Month',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Salary Month:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{rows[0].wage_month}</div>
                    </div>
                );
            }
        },
        {
            key: 'transaction_date',
            label: 'Transaction Date',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Transaction:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {format(rows[0].transaction_date, 'dd MMM yyy')}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return format(row.transaction_date, 'dd MMM yyy');
            }
        },
        {
            key: 'description',
            label: 'Description'
        },
        {
            key: 'employee_contribution',
            label: 'Employee Contribution',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (item) => item.employee_contribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.employee_contribution > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.employee_contribution.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                width: '100%',
                                justifyContent: 'right'
                            }}
                        >{`Total Amount:`}</div>
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) => ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.employee_contribution)).toFixed(2)}
                        </div>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'employer_contribution',
            label: 'Employer Contribution',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.employer_contribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.employer_contribution > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="table-body-column-icon icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.employer_contribution.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                width: '100%',
                                justifyContent: 'right'
                            }}
                        >{`Total Amount:`}</div>
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) => ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.employer_contribution)).toFixed(2)}
                        </div>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'pension_amount',
            label: 'Pension Amount',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.pension_amount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span style={{ color: row.pension_amount > 0 ? `${darkGreen}` : `${darkRed}` }}>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.pension_amount.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                width: '100%',
                                justifyContent: 'right'
                            }}
                        >{`Total Amount:`}</div>
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) => ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.pension_amount)).toFixed(2)}
                        </div>
                    </div>
                );
            },
            sortable: true
        }
    ];

    return (
        <Table
            columns={columns}
            count={count}
            rows={initialData}
            groupByColumn={[columns[0]]}
            onSort={(sortedColumn) => {
                if (!sortedColumn)
                    fetchInvestmentTransactions({
                        criteria: buildCriteria([], [{ key: 'transaction_date', ascending: false }])
                    });
                else
                    fetchInvestmentTransactions({
                        criteria: buildCriteria(
                            [],
                            [
                                {
                                    key: sortedColumn?.column.key,
                                    ascending: sortedColumn?.ascending
                                }
                            ]
                        )
                    });
            }}
        />
    );
};

export default ProvidentFund;
