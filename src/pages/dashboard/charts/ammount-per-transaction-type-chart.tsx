import { Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { ApiCriteria, getAllTransactions } from '../../../modules/backend/BackendApi';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';
import { useGlobalLoadingState } from '../../../index';

const AmountPerTransactionTypeChart = ({ range }: { range: { from: Date; to: Date } }) => {
    const [state, dispatch] = useGlobalLoadingState();
    const [amountPerTypeChartData, setAmountPerTypeChartData] = useState<{ [key: string]: number }>({});

    const _getCriteria = (start: Date, end: Date) => {
        let criteria: ApiCriteria = {
            filters: [],
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
            ]
        };
        return criteria;
    };

    useEffect(() => {
        getAllTransactions(
            {
                criteria: _getCriteria(range.from, range.to)
            },
            dispatch
        ).then((response) => {
            const sortedTransactions = ArrayUtil.sort(response.results, (item: Transaction) => item.transaction_date);
            const amountPerType: { [key: string]: number } = {};
            sortedTransactions.forEach((transaction) => {
                amountPerType[transaction.transaction_type.toString().toUpperCase()] = (amountPerType[transaction.transaction_type.toString().toUpperCase()] || 0) + transaction.amount;
            });
            setAmountPerTypeChartData(amountPerType);
        });
    }, [range]);

    return (
        <>
            <Doughnut
                data={{
                    labels: ['Income', 'Expense'],
                    datasets: [
                        {
                            label: 'Amount (Rs.)',
                            data: [amountPerTypeChartData['INCOME'], amountPerTypeChartData['EXPENSE']],
                            backgroundColor: ['green', 'red']
                        }
                    ]
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Amount Per Transaction Type'
                        }
                    }
                }}
            />
        </>
    );
};

export default AmountPerTransactionTypeChart;
