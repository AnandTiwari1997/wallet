import { format, parse } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { ApiCriteria, getAllTransactions } from '../../../modules/backend/BackendApi';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';
import { useGlobalLoadingState } from '../../../index';

const ExpenseChart = ({ range }: { range: { from: Date; to: Date } }) => {
    const [state, dispatch] = useGlobalLoadingState();
    const [expenseChartData, setExpenseChartData] = useState<{ key: string; value: number }[]>([]);

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
            const groupedTransaction: { [key: string]: number[] } = {};
            sortedTransactions.forEach((transaction) => {
                let key = format(new Date(transaction.transaction_date), 'dd-MM-yyyy');
                let array = groupedTransaction[key] || [];
                array.push(transaction.transaction_type.toString().toUpperCase() === 'INCOME' ? 0 : transaction.amount);
                groupedTransaction[key] = array;
            });
            const grT: { key: string; value: number }[] = [];
            for (let key in groupedTransaction) {
                grT.push({
                    key: key,
                    value: ArrayUtil.sum<number>(groupedTransaction[key], (item) => item)
                });
            }
            setExpenseChartData(grT);
        });
    }, [range]);

    return (
        <Line
            data={{
                labels: expenseChartData.map((value) => value.key),
                datasets: [
                    {
                        label: 'Amount (Rs.)',
                        data: expenseChartData.map((value) => value.value),
                        cubicInterpolationMode: 'monotone',
                        borderColor: 'red',
                        backgroundColor: 'red',
                        tension: 0.4
                    }
                ]
            }}
            options={{
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expense Per Day'
                    },
                    decimation: {
                        enabled: true,
                        algorithm: 'lttb'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true
                        },
                        ticks: {
                            callback: (tickValue, index) => {
                                return format(parse(expenseChartData[index].key, 'dd-MM-yyyy', new Date()), 'dd-MM');
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Rs.'
                        }
                    }
                }
            }}
        />
    );
};

export default ExpenseChart;
