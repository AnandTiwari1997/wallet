import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { ApiResponse, getInvestmentsTransaction } from '../../../modules/backend/BackendApi';
import { ProvidentFundTransaction } from '../../../data/models';
import { ArrayUtil } from '../../../data/transaction-data';
import { useGlobalLoadingState } from '../../../index';

const ProvidentFundInvestmentChart = () => {
    const [state, dispatch] = useGlobalLoadingState();
    const [employeeContributionChartData, setEmployeeContributionChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);
    const [employerContributionChartData, setEmployerContributionChartData] = useState<
        {
            key: string;
            value: number;
        }[]
    >([]);

    useEffect(() => {
        getInvestmentsTransaction('provident_fund', {}, dispatch).then((apiResponse: ApiResponse<ProvidentFundTransaction>) => {
            const groupedEmployerContribution: { [key: string]: number[] } = {};
            apiResponse.results.forEach((transaction) => {
                let key = transaction.financial_year;
                let array = groupedEmployerContribution[key] || [];
                array.push(transaction.employer_contribution);
                groupedEmployerContribution[key] = array;
            });
            const groupedEmployeeContribution: { [key: string]: number[] } = {};
            apiResponse.results.forEach((transaction) => {
                let key = transaction.financial_year;
                let array = groupedEmployeeContribution[key] || [];
                array.push(transaction.employee_contribution);
                groupedEmployeeContribution[key] = array;
            });
            const employee: { key: string; value: number }[] = [];
            const employer: { key: string; value: number }[] = [];
            for (let key in groupedEmployeeContribution) {
                employee.push({
                    key: key,
                    value: ArrayUtil.sum<number>(groupedEmployeeContribution[key], (item) => item)
                });
                employer.push({
                    key: key,
                    value: ArrayUtil.sum<number>(groupedEmployerContribution[key], (item) => item)
                });
            }
            setEmployerContributionChartData(employer);
            setEmployeeContributionChartData(employee);
        });
    }, []);

    return (
        <>
            <Bar
                data={{
                    labels: employeeContributionChartData.map((value) => value.key),
                    datasets: [
                        {
                            label: 'Employee Contribution (Rs.)',
                            data: employeeContributionChartData.map((value) => value.value),
                            borderColor: 'green',
                            backgroundColor: 'green'
                        },
                        {
                            label: 'Employer Contribution (Rs.)',
                            data: employerContributionChartData.map((value) => value.value),
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
                            text: 'Contribution Per Financial Year'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Financial Year'
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

export default ProvidentFundInvestmentChart;
