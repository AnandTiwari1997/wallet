import { Doughnut } from 'react-chartjs-2';
import { useGlobalLoadingState } from '../../../index';
import { useEffect, useState } from 'react';
import { getAccounts } from '../../../modules/backend/BackendApi';
import { ArrayUtil } from '../../../data/transaction-data';

const CreditCardBalancePerAccountChart = () => {
    const [state, dispatch] = useGlobalLoadingState();
    const [liabilityAccount, setLiabilityAccount] = useState<{ [key: string]: number }>({});
    const [creditCardAccountChartData, setCreditCardChartData] = useState<{ key: string; value: number }[]>([]);

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
            setCreditCardChartData(creditCardAccountChartData);
        });
    }, []);

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
