import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { Account } from '../../../data/models';
import { ArrayUtil } from '../../../data/transaction-data';

const BalancePerAccountChart = ({ data }: { data: Account[] }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [liabilityAccount, setLiabilityAccount] = useState<{ [key: string]: number }>({});
    const [balanceAccount, setBalanceAccount] = useState<{ [key: string]: number }>({});
    const [bankAccountChartData, setBankAccountChartData] = useState<{ key: string; value: number }[]>([]);
    const [cashAccountChartData, setCashAccountChartData] = useState<{ key: string; value: number }[]>([]);

    useEffect(() => {
        const loanAccounts = data.filter((value) => value.account_type === 'LOAN');
        liabilityAccount.LOAN = -1 * ArrayUtil.sum(loanAccounts, (item) => item.account_balance);
        const loanAccountChartData = loanAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        const creditCardAccounts = data.filter((value) => value.account_type === 'CREDIT_CARD');
        liabilityAccount.CREDIT_CARD =
            -1 *
            ArrayUtil.sum(
                data.filter((value) => value.account_type === 'CREDIT_CARD'),
                (item) => item.account_balance
            );
        const creditCardAccountChartData = creditCardAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        const bankAccounts = data.filter((value) => value.account_type === 'BANK');
        balanceAccount.BANK = ArrayUtil.sum(
            data.filter((value) => value.account_type === 'BANK'),
            (item) => item.account_balance
        );
        const bankAccountChartData = bankAccounts.map((value) => {
            return { key: value.account_name, value: value.account_balance };
        });
        const cashAccounts = data.filter((value) => value.account_type === 'CASH');
        balanceAccount.CASH = ArrayUtil.sum(
            data.filter((value) => value.account_type === 'CASH'),
            (item) => item.account_balance
        );
        const cashAccountChartData = cashAccounts.map((value) => {
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
