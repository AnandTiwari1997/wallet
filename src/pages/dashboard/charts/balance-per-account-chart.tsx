import { useEffect, useState } from 'react';
import { ArrayUtil } from '../../../data/transaction-data';
import { useGlobalLoadingState } from '../../../index';
import { Account } from '../../../data/models';
import { Doughnut } from 'react-chartjs-2';

const BalancePerAccountChart = ({ data }: { data: Account[] }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [state, dispatch] = useGlobalLoadingState();
    const [liabilityAccount, setLiabilityAccount] = useState<{ [key: string]: number }>({});
    const [balanceAccount, setBalanceAccount] = useState<{ [key: string]: number }>({});
    const [bankAccountChartData, setBankAccountChartData] = useState<{ key: string; value: number }[]>([]);
    const [cashAccountChartData, setCashAccountChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        let loanAccounts = data.filter((value) => value.account_type === 'LOAN');
        liabilityAccount['LOAN'] = -1 * ArrayUtil.sum(loanAccounts, (item) => item.account_balance);
        let loanAccountChartData = loanAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        let creditCardAccounts = data.filter((value) => value.account_type === 'CREDIT_CARD');
        liabilityAccount['CREDIT_CARD'] =
            -1 *
            ArrayUtil.sum(
                data.filter((value) => value.account_type === 'CREDIT_CARD'),
                (item) => item.account_balance
            );
        let creditCardAccountChartData = creditCardAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        let bankAccounts = data.filter((value) => value.account_type === 'BANK');
        balanceAccount['BANK'] = ArrayUtil.sum(
            data.filter((value) => value.account_type === 'BANK'),
            (item) => item.account_balance
        );
        let bankAccountChartData = bankAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        let cashAccounts = data.filter((value) => value.account_type === 'CASH');
        balanceAccount['CASH'] = ArrayUtil.sum(
            data.filter((value) => value.account_type === 'CASH'),
            (item) => item.account_balance
        );
        let cashAccountChartData = cashAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });

        setAccounts(data);
        setLiabilityAccount(liabilityAccount);
        setBankAccountChartData(bankAccountChartData);
        setCashAccountChartData(cashAccountChartData);
    }, [data]);
    return (
        <Doughnut
            data={{
                labels: [...bankAccountChartData, ...cashAccountChartData].map((value) => value.key),
                datasets: [
                    {
                        label: 'Amount (Rs.)',
                        data: [...bankAccountChartData, ...cashAccountChartData].map((value) => value.value),
                        backgroundColor: ['lightgreen', 'green', 'orange']
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
                        text: 'Amount Per Balance Account Type'
                    }
                }
            }}
        />
    );
};

export default BalancePerAccountChart;
