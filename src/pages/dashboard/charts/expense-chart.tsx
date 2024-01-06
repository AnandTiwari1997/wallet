import { format, parse } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';

const ExpenseChart = ({ data }: { data: Transaction[] }) => {
    const [expenseChartData, setExpenseChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        const sortedTransactions = ArrayUtil.sort(data, (item: Transaction) => item.transaction_date);
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
    }, [data]);

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
