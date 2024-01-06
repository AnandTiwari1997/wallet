import { useEffect, useState } from 'react';
import { ApiCriteria, getAllTransactions } from '../../../modules/backend/BackendApi';
import { useGlobalLoadingState } from '../../../index';
import { ArrayUtil } from '../../../data/transaction-data';
import { Transaction } from '../../../data/models';
import { format, subYears } from 'date-fns';
import { ChartDataset } from 'chart.js';
import { Line } from 'react-chartjs-2';

const CreditCardUsagePerMonthChart = ({ range }: { range: { from: Date; to: Date } }) => {
    const [state, dispatch] = useGlobalLoadingState();
    const [dataset, setDataset] = useState<ChartDataset<'line'>[]>([]);
    const [labels, setLables] = useState<string[]>([]);

    const _getCriteria = (start: Date, end: Date) => {
        let criteria: ApiCriteria = {
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
        getAllTransactions(
            {
                criteria: _getCriteria(subYears(new Date(), 1), new Date())
            },
            dispatch
        ).then((apiResponse) => {
            let creditCardTransactions = apiResponse.results.filter((value) => value.account.account_type === 'CREDIT_CARD');
            let groupedByAccountId = ArrayUtil.groupBy<Transaction>(creditCardTransactions, (item) => item.account.account_id.toString());
            let dataSets: ChartDataset<'line'>[] = [];
            let labels: { [key: string]: boolean } = {};
            let label: string[] = [];
            for (let id in groupedByAccountId) {
                let transactions = groupedByAccountId[id];
                let groupByMonthYear: { [key: string]: number } = {};
                for (let transaction of transactions) {
                    let key = format(new Date(transaction.transaction_date), 'MMM-yyyy');
                    groupByMonthYear[key] = (groupByMonthYear[key] || 0) + (transaction.transaction_type === 'Expense' ? transaction.amount : 0);
                }
                let data = [];
                for (let gt in groupByMonthYear) {
                    if (!labels[gt]) {
                        label.push(gt);
                        labels[gt] = true;
                    }
                    data.push(groupByMonthYear[gt]);
                }
                let dSet: ChartDataset<'line'> = {
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
