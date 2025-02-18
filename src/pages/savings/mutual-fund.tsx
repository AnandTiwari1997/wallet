import { darkGreen, darkRed } from 'App';
import { ApiRequestBody, ApiResponse, getInvestmentsTransaction } from 'backend/BackendApi';
import { MutualFundTransaction } from 'data/models';
import { ArrayUtil } from 'data/transaction-data';
import { format } from 'date-fns/esm';
import useAPI from 'hooks/useAPI';
import { indianRupee } from 'icons/icons';
import { Icon } from 'modules';
import { Table, TableColumn, TableData } from 'modules/table';
import { useEffect, useState } from 'react';

const MutualFund = () => {
    const [initialData, setInitialData] = useState<MutualFundTransaction[]>([]);
    const [count, setCount] = useState<number>(0);
    const [getData, loading] = useAPI<ApiRequestBody<MutualFundTransaction>, ApiResponse<MutualFundTransaction>>(
        getInvestmentsTransaction
    );

    const buildCriteria = (
        filters: {
            key: string;
            value: string[];
        }[] = [],
        sorts: {
            key: string;
            ascending: boolean;
        }[] = []
    ) => {
        return {
            filters: [...filters],
            sorts: [...sorts],
            groupBy: [{ key: 'fund_name' }],
            offset: 0,
            limit: 25
        };
    };

    const fetchInvestmentTransactions = (requestBody: ApiRequestBody<MutualFundTransaction>) => {
        getData('mutual_fund', requestBody)
            .then((response: ApiResponse<any>) => {
                setCount(response.num_found);
                const sortedTransactions = ArrayUtil.sort(
                    response.results,
                    (item: MutualFundTransaction) => item.fund_name
                );
                setInitialData(sortedTransactions);
            })
            .catch((reason) => {});
    };

    useEffect(() => {
        fetchInvestmentTransactions({
            criteria: buildCriteria([], [{ key: 'transaction_date', ascending: false }])
        });
    }, [setInitialData]);

    const columns: TableColumn[] = [
        {
            key: 'fund_name',
            label: 'Fund Name',
            groupByKey: (row: MutualFundTransaction) => row.fund_name
        },
        {
            key: 'transaction_date',
            label: 'Transaction Date',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Transaction:`}</div>
                        <div
                            style={{
                                width: '60%',
                                textAlign: 'left',
                                fontWeight: '700',
                                display: 'flex',
                                justifyContent: 'end',
                                alignItems: 'center'
                            }}
                        >
                            {format(rows[0].transaction_date, 'dd MMM yyy')}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return format(row.transaction_date, 'dd MMM yyy');
            },
            sortable: true
        },
        {
            key: 'nav',
            label: 'NAV',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'block' }}>
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
                            {rows[0].latest_nav.toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span>
                        <i className="table-body-column-icon icon">
                            <Icon
                                icon={indianRupee}
                                svgProps={{
                                    height: '12px',
                                    width: '12px'
                                }}
                            />
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
                            {ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.units).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.units > 0 ? `${darkGreen}` : `${darkRed}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {row.units.toFixed(2)}
                    </span>
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
                            {ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.amount).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.amount > 0 ? `${darkGreen}` : `${darkRed}`,
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
                        {row.amount.toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<MutualFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '100%',
                                justifyContent: 'right'
                            }}
                        >{`Total Invested:`}</div>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'right',
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
                            {ArrayUtil.sum(rows, (a: TableData<MutualFundTransaction>) =>
                                ArrayUtil.sum(a.data, (b: MutualFundTransaction) => b.amount)
                            ).toFixed(2)}
                        </div>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'amount',
            label: 'Current Amount',
            groupByRender: (rows: MutualFundTransaction[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
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
                    <span
                        style={{
                            color: row.units * row.latest_nav > row.amount ? `${darkGreen}` : `${darkRed}`,
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
                        {(row.units * row.latest_nav).toFixed(2)}
                    </span>
                );
            },
            columnFooter: (rows: TableData<MutualFundTransaction>[]) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div
                            style={{
                                width: '50%',
                                justifyContent: 'right'
                            }}
                        >{`Total Amount:`}</div>
                        <div
                            style={{
                                width: '50%',
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
                            {ArrayUtil.sum(
                                rows,
                                (a: TableData<MutualFundTransaction>) =>
                                    ArrayUtil.sum(a.data, (b: MutualFundTransaction) => b.units) *
                                    a.data[a.data.length - 1].latest_nav
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

export default MutualFund;
