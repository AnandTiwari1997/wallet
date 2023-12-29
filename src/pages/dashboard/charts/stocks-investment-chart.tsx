import { Line } from 'react-chartjs-2';
import { getStockHolding } from '../../../modules/backend/BackendApi';
import { useEffect, useState } from 'react';

const StocksInvestmentChart = () => {
    const [stockInvestedAmountChartData, setStockInvestedAmountChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);
    const [stockCurrentAmountChartData, setStockCurrentAmountChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);

    useEffect(() => {
        getStockHolding({}).then((apiResponse) => {
            const grT: { key: string; value: number }[] = [];
            const grT1: { key: string; value: number }[] = [];
            for (let holding of apiResponse.results) {
                if (Number.parseFloat(holding.invested_amount) <= 0) continue;
                grT.push({
                    key: holding.stock_symbol,
                    value: Number.parseFloat(holding.invested_amount)
                });
                grT1.push({
                    key: holding.stock_symbol,
                    value: Number.parseFloat(holding.total_shares) * holding.current_price
                });
            }
            setStockInvestedAmountChartData(grT);
            setStockCurrentAmountChartData(grT1);
        });
    }, []);
    return (
        <>
            <Line
                data={{
                    labels: stockInvestedAmountChartData.map((value) => value.key),
                    datasets: [
                        {
                            label: 'Invested Amount (Rs.)',
                            data: stockInvestedAmountChartData.map((value) => value.value),
                            borderColor: 'green',
                            backgroundColor: 'green'
                        },
                        {
                            label: 'Current Amount (Rs.)',
                            data: stockCurrentAmountChartData.map((value) => value.value),
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
                            text: 'Investment Per Stock'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Stocks'
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

export default StocksInvestmentChart;
