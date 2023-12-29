import { Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { getAccounts } from '../../../modules/backend/BackendApi';
import { ArrayUtil } from '../../../data/transaction-data';
import { useGlobalLoadingState } from '../../../index';

const LoanAccountBalancePerAccountChart = () => {
    const [state, dispatch] = useGlobalLoadingState();
    const [liabilityAccount, setLiabilityAccount] = useState<{ [key: string]: number }>({});
    const [loanAccountChartData, setLoanAccountChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        getAccounts(dispatch).then((response) => {
            let loanAccounts = response.results.filter((value) => value.account_type === 'LOAN');
            liabilityAccount['LOAN'] = -1 * ArrayUtil.sum(loanAccounts, (item) => item.account_balance);
            let loanAccountChartData = loanAccounts.map((value) => {
                return { key: value.account_name, value: value.account_balance };
            });
            let creditCardAccounts = response.results.filter((value) => value.account_type === 'CREDIT_CARD');
            liabilityAccount['CREDIT_CARD'] =
                -1 *
                ArrayUtil.sum(
                    response.results.filter((value) => value.account_type === 'CREDIT_CARD'),
                    (item) => item.account_balance
                );
            let creditCardAccountChartData = creditCardAccounts.map((value) => {
                return { key: value.account_name, value: value.account_balance };
            });

            setLiabilityAccount(liabilityAccount);
            setLoanAccountChartData(loanAccountChartData);
        });
    }, []);

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
