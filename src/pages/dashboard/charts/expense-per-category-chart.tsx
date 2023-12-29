import { useGlobalLoadingState } from '../../../index';
import { useEffect, useState } from 'react';
import { ApiCriteria, getAllTransactions } from '../../../modules/backend/BackendApi';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';
import { Doughnut } from 'react-chartjs-2';

const ExpensePerCategoryChart = ({ range }: { range: { from: Date; to: Date } }) => {
    const [state, dispatch] = useGlobalLoadingState();
    const [amountPerCategoryChartData, setAmountPerCategoryChartData] = useState<{ key: string; value: number }[]>([]);

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
            const groupedTransactionByCategory: { [key: string]: number[] } = {};
            const amountPerType: { [key: string]: number } = {};
            sortedTransactions.forEach((transaction) => {
                let key = transaction.category.toString();
                let array = groupedTransactionByCategory[key] || [];
                array.push(transaction.transaction_type.toString().toUpperCase() === 'INCOME' ? 0 : transaction.amount);
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
        });
    }, [range]);

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
