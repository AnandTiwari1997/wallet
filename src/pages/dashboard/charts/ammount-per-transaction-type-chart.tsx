import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { Transaction } from '../../../data/models';
import { ArrayUtil } from '../../../data/transaction-data';

const AmountPerTransactionTypeChart = ({ data }: { data: Transaction[] }) => {
    const [amountPerTypeChartData, setAmountPerTypeChartData] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const sortedTransactions = ArrayUtil.sort(data, (item: Transaction) => item.transaction_date);
        const amountPerType: { [key: string]: number } = {};
        sortedTransactions.forEach((transaction) => {
            amountPerType[transaction.transaction_type.toString().toUpperCase()] =
                (amountPerType[transaction.transaction_type.toString().toUpperCase()] || 0) + transaction.amount;
        });
        setAmountPerTypeChartData(amountPerType);
    }, [data]);

    return (
        <>
            <Doughnut
                data={{
                    labels: ['Income', 'Expense'],
                    datasets: [
                        {
                            label: 'Amount (Rs.)',
                            data: [amountPerTypeChartData.INCOME, amountPerTypeChartData.EXPENSE],
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
