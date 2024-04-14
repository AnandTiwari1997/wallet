import { ChartDataset } from 'chart.js';
import { format, subYears } from 'date-fns';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { Transaction } from '../../../data/models';
import { ArrayUtil } from '../../../data/transaction-data';
import { ApiCriteria, getAllTransactions } from '../../../modules/backend/BackendApi';

const CreditCardUsagePerMonthChart = ({ range }: { range: { from: Date; to: Date } }) => {
    const [dataset, setDataset] = useState<ChartDataset<'line'>[]>([]);
    const [labels, setLables] = useState<string[]>([]);

    const _getCriteria = (start: Date, end: Date) => {
        const criteria: ApiCriteria = {
            filters: [],
            groupBy: [{ key: 'dated' }],
            sorts: [{ key: 'dated', ascending: true }],
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
        getAllTransactions({
            criteria: _getCriteria(subYears(new Date(), 1), new Date())
        }).then((apiResponse) => {
            const creditCardTransactions = apiResponse.results.filter(
                (value) => value.account.account_type === 'CREDIT_CARD'
            );
            const groupedByAccountId = ArrayUtil.groupBy<Transaction>(creditCardTransactions, (item) =>
                item.account.account_id.toString()
            );
            const dataSets: ChartDataset<'line'>[] = [];
            const labels: { [key: string]: boolean } = {};
            const label: string[] = [];
            for (const id in groupedByAccountId) {
                const transactions = groupedByAccountId[id];
                const groupByMonthYear: { [key: string]: number } = {};
                for (const transaction of transactions) {
                    const key = format(new Date(transaction.transaction_date), 'MMM-yyyy');
                    groupByMonthYear[key] =
                        (groupByMonthYear[key] || 0) +
                        (transaction.transaction_type === 'Expense' ? transaction.amount : 0);
                }
                const data = [];
                for (const gt in groupByMonthYear) {
                    if (!labels[gt]) {
                        label.push(gt);
                        labels[gt] = true;
                    }
                    data.push(groupByMonthYear[gt]);
                }
                const dSet: ChartDataset<'line'> = {
                    data: data,
                    label: groupedByAccountId[id][0].account.account_name,
                    borderColor: 'green',
                    backgroundColor: 'green'
                };
                dataSets.push(dSet);
            }
            setLables(label);
            setDataset(dataSets);
        });
    }, []);

    return (
        <>
            <Line
                data={{
                    labels: labels,
                    datasets: dataset
                }}
                options={{
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Credit Card Usage Per Month'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Months'
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
        </>
    );
};

export default CreditCardUsagePerMonthChart;
