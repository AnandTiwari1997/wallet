import { Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { Account } from '../../../data/models';

const CreditCardBalancePerAccountChart = ({ data }: { data: Account[] }) => {
    const [creditCardAccountChartData, setCreditCardChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        let creditCardAccounts = data.filter((value) => value.account_type === 'CREDIT_CARD');
        let creditCardAccountChartData = creditCardAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });

        setCreditCardChartData(creditCardAccountChartData);
    }, [data]);

    return (
        <>
            <Doughnut
                data={{
                    labels: creditCardAccountChartData.map((value) => value.key),
                    datasets: [
                        {
                            label: 'Amount (Rs.)',
                            data: creditCardAccountChartData.map((value) => value.value),
                            backgroundColor: ['red', 'orange']
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
                            text: 'Remaining Amount Per Credit Card'
                        },
                        colors: {
                            enabled: true
                        },
                        tooltip: {}
                    }
                }}
            />
        </>
    );
};

export default CreditCardBalancePerAccountChart;
