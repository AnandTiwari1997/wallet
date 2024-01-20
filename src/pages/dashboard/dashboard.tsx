import CSS from 'csstype';
import './dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Account, Transaction } from '../../data/models';
import { edit, indianRupee, plus } from '../../icons/icons';
import CalenderPicker from '../../modules/calender-picker/calender-picker';
import { useEffect, useState } from 'react';
import { ApiCriteria, getAccounts, getAllTransactions } from '../../modules/backend/BackendApi';
import { useGlobalLoadingState } from '../../index';
import Dialog from '../../modules/dialog/dialog';
import AddAccount from '../account/add-account';
import { Chart, registerables } from 'chart.js';
import { startOfMonth } from 'date-fns';
import ExpenseChart from './charts/expense-chart';
import LoanAccountBalancePerAccountChart from './charts/loan-account-balance-per-account-chart';
import MutualFundInvestmentChart from './charts/mutual-fund-investment-chart';
import ProvidentFundInvestmentChart from './charts/provident-fund-investment-chart';
import StocksInvestmentChart from './charts/stocks-investment-chart';
import StockInvestmentChart from './charts/stock-investment-chart';
import AmountPerTransactionTypeChart from './charts/ammount-per-transaction-type-chart';
import ExpensePerCategoryChart from './charts/expense-per-category-chart';
import BalancePerAccountChart from './charts/balance-per-account-chart';
import CreditCardUsagePerMonthChart from './charts/credit-card-usage-per-month-chart';
import CreditCardBalancePerAccountChart from './charts/credit-card-balance-per-account-chart';
import Icon from '../../modules/icon/icon';
import IconButton from '../../modules/icon/icon-button';

Chart.register(...registerables);

const accountTopDivStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    height: '19%',
    margin: '1%',
    background: 'rgb(255, 255, 255)',
    boxShadow: 'rgba(255, 255, 255, 0.45) -3px -3px 7px, rgba(128, 135, 148, 0.56) 2px 2px 5px'
};

const cardWrapperStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%'
};

const addAccountCardStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center'
};

const resetAccountSelectionStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    width: '5%',
    alignItems: 'center',
    justifyContent: 'center'
};

const scrollableDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    width: '85%',
    alignItems: 'center'
};

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const DashboardPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [state, dispatch] = useGlobalLoadingState();
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
    const [range, setRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    });
    const [accountForDashboard, setAccountForDashboard] = useState<Account | undefined>(undefined);

    const _getCriteria = (start: Date, end: Date) => {
        let criteria: ApiCriteria = {
            filters: accountForDashboard ? [{ key: 'account', value: `${accountForDashboard.account_id}` }] : [],
            groupBy: [{ key: 'dated' }],
            sorts: [{ key: 'dated', ascending: false }],
            between: [
                {
                    key: 'transaction_date',
                    range: {
                        start: start.toISOString(),
                        end: end.toISOString()
                    }
                }
            ]
        };
        return criteria;
    };

    useEffect(() => {
        getAccounts(dispatch).then((response) => {
            setAccounts(response.results);
        });
        getAllTransactions(
            {
                criteria: _getCriteria(range.from, range.to)
            },
            dispatch
        ).then((response) => {
            setTransactions(response.results);
        });
    }, [range, accountForDashboard]);

    const accountCards = accounts.map((account) => {
        const backgroundColor: CSS.Properties = {
            backgroundColor: `${
                typeof account.bank === 'object'
                    ? accountForDashboard
                        ? accountForDashboard.account_id === account.account_id
                            ? account.bank.primary_color
                            : '#ccd2db'
                        : account.bank.primary_color
                    : '#e5e9ed'
            }`,
            color: `${typeof account.bank === 'object' && account.bank.primary_color ? 'rgb(255, 255, 255)' : 'black'}`,
            display: 'flex',
            alignItems: 'center'
        };
        return (
            <div
                key={account.account_id}
                className="account-card"
                style={backgroundColor}
                onClick={(event) => {
                    setAccountForDashboard(account);
                }}
            >
                <div className={'pencil'}>
                    <IconButton
                        icon={edit}
                        className={'alternate'}
                        onClick={(event) => {
                            setShowAddAccount(true);
                            setSelectedAccount(account);
                            event.stopPropagation();
                        }}
                    />
                </div>
                <div className="account-icon-container">{account.bank && <i className="account-icon" dangerouslySetInnerHTML={{ __html: account.bank.icon }}></i>}</div>
                <div className="account-details-container">
                    <div className="account-name">
                        <span>
                            <span>{account.account_name}</span>
                        </span>
                    </div>
                    <div className="account-balance">
                        <span className="">
                            <Icon icon={indianRupee} className={'custom-font-size'} />
                            {account.account_balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div style={topDiv}>
            <div style={accountTopDivStyle}>
                <div style={addAccountCardStyle}>
                    <button
                        className="add-account-button"
                        onClick={() => {
                            setShowAddAccount(true);
                            setSelectedAccount(undefined);
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={plus} />
                        </i>
                        <span>Add Account</span>
                    </button>
                </div>
                {accountForDashboard && (
                    <div style={resetAccountSelectionStyle}>
                        <button
                            className="reset-account-selection"
                            onClick={() => {
                                setAccountForDashboard(undefined);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                )}
                <div style={scrollableDiv}>
                    <div style={cardWrapperStyle}>{accountCards}</div>
                </div>
            </div>
            <div className="_1G4RrpLL512uJptsH35-hS">
                <CalenderPicker
                    onChange={(item) => {
                        setRange({ from: item.rangeStart, to: item.rangeEnd });
                    }}
                    range={range}
                />
            </div>
            <div className="dashboard_chart_body_wrapper">
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <ExpenseChart data={transactions} />
                        </div>
                    </div>
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <AmountPerTransactionTypeChart data={transactions} />
                        </div>
                    </div>
                </div>
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <ExpensePerCategoryChart data={transactions} />
                        </div>
                    </div>
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <BalancePerAccountChart data={accounts} />
                        </div>
                    </div>
                </div>
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <LoanAccountBalancePerAccountChart data={accounts} />
                        </div>
                    </div>
                </div>
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <div className="dashboard_chart">
                            <CreditCardBalancePerAccountChart data={accounts} />
                        </div>
                    </div>
                    <div className="dashboard_chart_wrapper">
                        <CreditCardUsagePerMonthChart range={range} />
                    </div>
                </div>
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <MutualFundInvestmentChart />
                    </div>
                    <div className="dashboard_chart_wrapper">
                        <ProvidentFundInvestmentChart />
                    </div>
                </div>
                <div className="dashboard_chart_row_wrapper">
                    <div className="dashboard_chart_wrapper">
                        <StocksInvestmentChart />
                    </div>
                    <div className="dashboard_chart_wrapper">
                        <StockInvestmentChart />
                    </div>
                </div>
            </div>
            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setShowAddAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Account"
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getAccounts(dispatch).then((response) => {
                                setAccounts(response.results);
                            });
                            console.log(`Account ${data} has been add Successfully.`);
                        } else {
                            console.log(`Error occurred while adding Account ${data}.`);
                        }
                        setSelectedAccount(undefined);
                        setShowAddAccount(false);
                    }}
                />
            </Dialog>
        </div>
    );
};

export default DashboardPage;
