import { darkGreen, darkRed } from 'App';
import { ApiRequestBody, ApiResponse, getInvestmentsTransaction } from 'backend/BackendApi';
import { ProvidentFundTransaction } from 'data/models';
import { ArrayUtil } from 'data/transaction-data';
import { format } from 'date-fns/esm';
import useAPI from 'hooks/useAPI';
import { indianRupee } from 'icons/icons';
import { Icon } from 'modules';
import { Table, TableColumn, TableData } from 'modules/table';
import { useEffect, useState } from 'react';

const ProvidentFund = () => {
    const [initialData, setInitialData] = useState<ProvidentFundTransaction[]>([]);
    const [count, setCount] = useState<number>(0);
    const [getData, loading] = useAPI<ApiRequestBody<ProvidentFundTransaction>, ApiResponse<ProvidentFundTransaction>>(
        getInvestmentsTransaction
    );

    const buildCriteria = (
        filters: { key: string; value: string[] }[] = [],
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
        getData('provident_fund', requestBody)
            .then((response: ApiResponse<any>) => {
                setCount(response.num_found);
                // const formattedTransactions: ProvidentFundTransaction[] = ArrayUtil.map(response.results, (item: any) => ProvidentFundTransaction.build(item));
                const sortedTransactions = ArrayUtil.sort(
                    response.results,
                    (item: ProvidentFundTransaction) => item.financial_year
                );
                setInitialData(sortedTransactions);
            })
            .catch((reason) => {});
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
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Salary Month:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {rows[0].wage_month}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span
                        style={{
                            textAlign: 'right'
                        }}
                    >
                        {row.wage_month}
                    </span>
                );
            }
        },
        {
            key: 'transaction_date',
            label: 'Transaction Date',
            groupByRender: (rows: ProvidentFundTransaction[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Transaction:`}</div>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
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
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
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
                            {ArrayUtil.sum(rows, (item) => item.employee_contribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.employee_contribution > 0 ? `${darkGreen}` : `${darkRed}`,
                            display: 'flex',
                            justifyContent: 'center',
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
                        {row.employee_contribution.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                                fontWeight: '700',
                                alignItems: `center`
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) =>
                                ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.employee_contribution)
                            ).toFixed(2)}
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
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
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
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.employer_contribution).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.employer_contribution > 0 ? `${darkGreen}` : `${darkRed}`,
                            display: 'flex',
                            justifyContent: 'center',
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
                        {row.employer_contribution.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                                fontWeight: '700',
                                alignItems: `center`
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) =>
                                ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.employer_contribution)
                            ).toFixed(2)}
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
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'center',
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
                            {ArrayUtil.sum(rows, (a: ProvidentFundTransaction) => a.pension_amount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: ProvidentFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.pension_amount > 0 ? `${darkGreen}` : `${darkRed}`,
                            display: 'flex',
                            justifyContent: 'center',
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
                        {row.pension_amount.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<ProvidentFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                                fontWeight: '700',
                                alignItems: `center`
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
                            {ArrayUtil.sum(rows, (a: TableData<ProvidentFundTransaction>) =>
                                ArrayUtil.sum(a.data, (b: ProvidentFundTransaction) => b.pension_amount)
                            ).toFixed(2)}
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
            isLoading={loading}
            onSort={(sortedColumn) => {
                if (!sortedColumn) {
                    fetchInvestmentTransactions({
                        criteria: buildCriteria([], [{ key: 'transaction_date', ascending: false }])
                    });
                } else {
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
                }
            }}
        />
    );
};

export default ProvidentFund;
