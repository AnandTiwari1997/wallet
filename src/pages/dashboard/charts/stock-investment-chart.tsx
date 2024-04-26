import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { DematAccount } from '../../../data/models';
import { getStockAccount, getStockHolding, getStockTransaction } from '../../../modules/backend/BackendApi';
import Select, { SelectOption } from '../../../modules/select/select';

const StockInvestmentChart = () => {
    const [stockInvestmentTransactionChartData, setStockInvestmentTransactionChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);
    const [selectedHolding, setSelectedHolding] = useState<string>();
    const [holdingOptions, setHoldingOptions] = useState<SelectOption[]>([]);
    const [brokers, setBrokers] = useState<{ [key: string]: DematAccount }>();

    const getStockTransactions = (holdingId: string) => {
        const grT: {
            key: string;
            value: number;
        }[] = [];
        getStockTransaction({
            criteria: {
                filters: [{ key: 'holding_id', value: [holdingId] }],
                sorts: [{ key: 'transaction_date', ascending: true }],
                groupBy: [{ key: 'holding_id' }]
            }
        }).then((response) => {
            const groupedTransaction: { [key: string]: number } = {};
            response.results.forEach((value) => {
                const key = format(new Date(value.transaction_date), 'dd-MM-yyyy');
                groupedTransaction[key] = value.amount;
            });
            for (const key in groupedTransaction) {
                grT.push({
                    key: key,
                    value: groupedTransaction[key]
                });
            }
            setStockInvestmentTransactionChartData(grT);
        });
    };

    useEffect(() => {
        getStockAccount({}).then((response) => {
            const brokers: { [key: string]: DematAccount } = {};
            response.results.forEach((value) => {
                brokers[value.account_bo_id] = value;
            });
            setBrokers(brokers);
            getStockHolding({
                criteria: {
                    sorts: [
                        {
                            key: 'stock_name',
                            ascending: true
                        }
                    ]
                }
            }).then((apiResponse) => {
                const options: SelectOption[] = [];
                for (const holding of apiResponse.results) {
                    if (Number.parseFloat(holding.invested_amount) <= 0) {
                        continue;
                    }
                    options.push({
                        label: holding.stock_name + (brokers ? ' - ' + brokers[holding.account_id].account_name : ''),
                        value: holding.holding_id
                    });
                }
                setHoldingOptions(options);
                setSelectedHolding(options[0].value);
                getStockTransactions(options[0].value);
            });
        });
    }, []);
    return (
        <>
            <div
                style={{
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'center',
                    margin: '0 10px'
                }}
            >
                <Select
                    selectedOption={selectedHolding}
                    options={holdingOptions}
                    onSelectionChange={(event) => {
                        setSelectedHolding(event.value);
                        getStockTransactions(event.value);
                    }}
                />
            </div>
            <div
                style={{
                    height: 'calc(100% - 50px)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Line
                    data={{
                        labels: stockInvestmentTransactionChartData.map((value) => value.key),
                        datasets: [
                            {
                                label: 'Invested Amount (Rs.)',
                                data: stockInvestmentTransactionChartData.map((value) => value.value),
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
                                // ticks: {
                                //     callback: (tickValue, index) => {
                                //         return format(new Date(stockInvestmentTransactionChartData[index].key), 'dd-MM-yyyy');
                                //     }
                                // }
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
            </div>
        </>
    );
};

export default StockInvestmentChart;
