import { useEffect, useState } from 'react';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';
import { Doughnut } from 'react-chartjs-2';

const ExpensePerCategoryChart = ({ data }: { data: Transaction[] }) => {
    const [amountPerCategoryChartData, setAmountPerCategoryChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        const sortedTransactions = ArrayUtil.sort(data, (item: Transaction) => item.transaction_date);
        const groupedTransactionByCategory: { [key: string]: number[] } = {};
        sortedTransactions.forEach((transaction) => {
            if (transaction.transaction_type.toString().toUpperCase() === 'INCOME') return;
            let key = transaction.category.toString();
            let array = groupedTransactionByCategory[key] || [];
            array.push(transaction.amount);
            groupedTransactionByCategory[key] = array;
        });
        const grT: { key: string; value: number }[] = [];
        for (let key in groupedTransactionByCategory) {
            grT.push({
                key: key,
                value: ArrayUtil.sum<number>(groupedTransactionByCategory[key], (item) => item)
            });
        }
        setAmountPerCategoryChartData(grT);
    }, [data]);

    return (
        <Doughnut
            data={{
                labels: amountPerCategoryChartData.map((value) => value.key),
                datasets: [
                    {
                        label: 'Amount (Rs.)',
                        data: amountPerCategoryChartData.map((value) => value.value),
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
                        text: 'Expense Per Category'
                    }
                }
            }}
        />
    );
};

export default ExpensePerCategoryChart;
