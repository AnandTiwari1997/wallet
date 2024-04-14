import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { Account } from '../../../data/models';

const LoanAccountBalancePerAccountChart = ({ data }: { data: Account[] }) => {
    const [loanAccountChartData, setLoanAccountChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        const loanAccounts = data.filter((value) => value.account_type === 'LOAN');
        const loanAccountChartData = loanAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        setLoanAccountChartData(loanAccountChartData);
    }, [data]);

    return (
        <>
            <Doughnut
                data={{
                    labels: loanAccountChartData.map((value) => value.key),
                    datasets: [
                        {
                            label: 'Amount (Rs.)',
                            data: loanAccountChartData.map((value) => value.value),
                            backgroundColor: ['orange', 'red']
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
                            text: 'Remaining Amount Per Loan Account'
                        }
                    }
                }}
            />
        </>
    );
};

export default LoanAccountBalancePerAccountChart;
