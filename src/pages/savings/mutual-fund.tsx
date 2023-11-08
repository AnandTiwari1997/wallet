import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { indianRupee } from '../../icons/icons';
import { ArrayUtil } from '../../data/transaction-data';
import { format } from 'date-fns/esm';
import { useEffect, useState } from 'react';
import { ApiRequestBody, ApiResponse, getInvestmentsTransaction } from '../../modules/backend/BackendApi';
import Table, { TableColumn } from '../../modules/table/table';
import { darkGreen, darkRed } from '../../App';
import { useGlobalLoadingState } from '../../index';
import { MutualFundTransaction } from '../../data/models';

const MutualFund = () => {
    const [initialData, setInitialData] = useState<MutualFundTransaction[]>([]);
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
            groupBy: [{ key: 'fund_name' }],
            offset: 0,
            limit: 25
        };
    };

    const fetchInvestmentTransactions = (requestBody: ApiRequestBody<MutualFundTransaction>) => {
        getInvestmentsTransaction('mutual_fund', requestBody, dispatch)
            .then((response: ApiResponse<any>) => {
                setCount(response.num_found);
                const sortedTransactions = ArrayUtil.sort(response.results, (item: MutualFundTransaction) => item.fund_name);
                setInitialData(sortedTransactions);
            })
            .catch((reason) => {
                console.log(reason);
            });
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
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="table-body-column-icon icon">
                                <FontAwesomeIcon icon={indianRupee} />
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
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontWeight: '700'
                            }}
                        >
                            {ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.units).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return <span style={{ color: row.units > 0 ? `${darkGreen}` : `${darkRed}` }}>{row.units.toFixed(2)}</span>;
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
                            {(ArrayUtil.sum(rows, (a: MutualFundTransaction) => a.units) * rows[rows.length - 1].latest_nav).toFixed(2)}
                        </div>
                    </div>
                );
            },
            customRender: (row: MutualFundTransaction) => {
                return (
                    <span
                        style={{
                            color: row.units * row.latest_nav > row.amount ? `${darkGreen}` : `${darkRed}`
                        }}
                    >
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
            count={count}
            rows={initialData}
            groupByColumn={columns[0]}
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

export default MutualFund;
