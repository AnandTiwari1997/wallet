import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { MutualFundTransaction } from '../../../data/models';
import { ArrayUtil } from '../../../data/transaction-data';
import { ApiResponse, getInvestmentsTransaction } from '../../../modules/backend/BackendApi';

const MutualFundInvestmentChart = () => {
    const [mutualFundInvestedAmountCharData, setMutualFundInvestedAmountChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);
    const [mutualFundCurrentAmountCharData, setMutualFundCurrentAmountChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);

    useEffect(() => {
        getInvestmentsTransaction('mutual_fund', {}).then((apiResponse: ApiResponse<MutualFundTransaction>) => {
            const groupedTransaction: { [key: string]: number[] } = {};
            const groupedTransaction1: { [key: string]: MutualFundTransaction[] } = {};
            apiResponse.results.forEach((transaction) => {
                const key = transaction.fund_name;
                const array = groupedTransaction[key] || [];
                array.push(transaction.is_credit ? transaction.amount : -1 * transaction.amount);
                groupedTransaction[key] = array;
                const array1 = groupedTransaction1[key] || [];
                array1.push(transaction);
                groupedTransaction1[key] = array1;
            });
            const grT: { key: string; value: number }[] = [];
            const grT1: { key: string; value: number }[] = [];
            for (const key in groupedTransaction) {
                grT.push({
                    key: key,
                    value: ArrayUtil.sum<number>(groupedTransaction[key], (item) => item)
                });
                grT1.push({
                    key: key,
                    value:
                        ArrayUtil.sum<MutualFundTransaction>(groupedTransaction1[key], (item) =>
                            item.is_credit ? item.units : -1 * item.units
                        ) * groupedTransaction1[key][0].latest_nav
                });
            }
            setMutualFundInvestedAmountChartData(grT);
            setMutualFundCurrentAmountChartData(grT1);
        });
    }, []);

    return (
        <>
            <Line
                data={{
                    labels: mutualFundInvestedAmountCharData.map((value) => value.key),
                    datasets: [
                        {
                            label: 'Invested Amount (Rs.)',
                            data: mutualFundInvestedAmountCharData.map((value) => value.value),
                            borderColor: 'green',
                            backgroundColor: 'green'
                        },
                        {
                            label: 'Current Amount (Rs.)',
                            data: mutualFundCurrentAmountCharData.map((value) => value.value),
                            borderColor: 'green',
                            backgroundColor: 'green'
                        }
                    ]
                }}
                options={{
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Investment Per Fund'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Funds'
                            },
                            ticks: {
                                callback: (tickValue, index, ticks) => {
                                    return tickValue;
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
        </>
    );
};

export default MutualFundInvestmentChart;
