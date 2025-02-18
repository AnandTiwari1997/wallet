import 'pages/dashboard/dashboard.css';

import { ApiCriteria, ApiRequestBody, ApiResponse, getAccounts, getAllTransactions } from 'backend/BackendApi';
import { CalenderPicker } from 'boxed-material-ui/modules';
import { Chart, registerables } from 'chart.js';
import CSS from 'csstype';
import { Account, Transaction } from 'data/models';
import { startOfMonth } from 'date-fns';
import useAPI from 'hooks/useAPI';
import { edit, enlarge, indianRupee } from 'icons/icons';
import { Dialog, Icon, IconButton } from 'modules';
import AddAccount from 'pages/account/add-account';
import { ReactNode, useEffect, useState } from 'react';

Chart.register(...registerables);

const accountTopDivStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    height: '19%',
    margin: '1%',
    background: 'rgb(255, 255, 255)'
    // boxShadow: 'rgba(255, 255, 255, 0.45) -3px -3px 7px, rgba(128, 135, 148, 0.56) 2px 2px 5px'
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
    width: '100%',
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
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
    const [range, setRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date()
    });
    const [accountForDashboard, setAccountForDashboard] = useState<Account | undefined>(undefined);
    const [getTransactions, isAllTransactionsDone] = useAPI<ApiRequestBody<Transaction>, ApiResponse<Transaction>>(
        getAllTransactions
    );
    const [showFullViewChart, setShowFullViewChart] = useState(false);
    const [fullViewChartComponent, setFullViewChartComponent] = useState<ReactNode>();
    const [fullViewChartTitle, setFullViewChartTitle] = useState<string>('');

    const _getCriteria = (start: Date, end: Date) => {
        const criteria: ApiCriteria = {
            filters: accountForDashboard ? [{ key: 'account', value: [`${accountForDashboard.account_id}`] }] : [],
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

    const enlargeButton = (
        <IconButton
            svgProps={{
                height: '16px',
                width: '16px'
            }}
            icon={enlarge}
            onClick={(event) => {}}
        />
    );

    useEffect(() => {
        getAccounts().then((response) => {
            setAccounts(response.results);
        });
        getTransactions({
            criteria: _getCriteria(range.from, range.to)
        }).then((response) => {
            setTransactions(response.results);
        });
    }, [range, accountForDashboard]);

    const accountCards = accounts.map((account) => {
        const backgroundColor: CSS.Properties = {
            backgroundColor: `${
                // eslint-disable-next-line no-nested-ternary
                typeof account.bank === 'object'
                    ? // eslint-disable-next-line no-nested-ternary
                      accountForDashboard
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
                        svgProps={{
                            height: '16px',
                            width: '16px'
                        }}
                        icon={edit}
                        className={'alternate'}
                        onClick={(event) => {
                            setShowAddAccount(true);
                            setSelectedAccount(account);
                            event.stopPropagation();
                        }}
                    />
                </div>
                <div className="account-icon-container">
                    {account.bank && (
                        <i className="account-icon" dangerouslySetInnerHTML={{ __html: account.bank.icon }}></i>
                    )}
                </div>
                <div className="account-details-container">
                    <div className="account-name">
                        <span>
                            <span>{account.account_name}</span>
                        </span>
                    </div>
                    <div className="account-balance">
                        <span className="">
                            <Icon
                                icon={indianRupee}
                                className={'custom-font-size'}
                                svgProps={{
                                    height: '16px',
                                    width: '16px'
                                }}
                            />
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
                {/*<div style={addAccountCardStyle}>*/}
                {/*    <Button*/}
                {/*        className="add-account-Button"*/}
                {/*        onClick={() => {*/}
                {/*            setShowAddAccount(true);*/}
                {/*            setSelectedAccount(undefined);*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <i className="Icon">*/}
                {/*            <Icon Icon={plus} />*/}
                {/*        </i>*/}
                {/*        <span>Add Account</span>*/}
                {/*    </Button>*/}
                {/*</div>*/}
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
            <div
                style={{
                    overflow: 'scroll',
                    height: 'calc(82% - 3rem)',
                    width: `100%`
                }}
            >
                {/*<Grids spacing={1} style={{ margin: '1%' }}>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader*/}
                {/*                header={'Expense Per Day'}*/}
                {/*                action={*/}
                {/*                    <IconButton*/}
                {/*                        svgProps={{*/}
                {/*                            height: '16px',*/}
                {/*                            width: '16px'*/}
                {/*                        }}*/}
                {/*                        Icon={enlarge}*/}
                {/*                        onClick={(event) => {*/}
                {/*                            setFullViewChartComponent(<ExpenseChart data={transactions} />);*/}
                {/*                            setShowFullViewChart(true);*/}
                {/*                            setFullViewChartTitle('Expense Per Day');*/}
                {/*                        }}*/}
                {/*                    />*/}
                {/*                }*/}
                {/*            />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <ExpenseChart data={transactions} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Credit Card Usage Per Month'} action={enlargeButton} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <CreditCardUsagePerMonthChart range={range} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader*/}
                {/*                components={{*/}
                {/*                    heading: 'Amount Per Transaction Type'*/}
                {/*                }}*/}
                {/*            />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <AmountPerTransactionTypeChart data={transactions} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Expense Per Category'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <ExpensePerCategoryChart data={transactions} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={4} xl={4}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Amount Per Balance Account Type'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <BalancePerAccountChart data={accounts} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={4} xl={4}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Remaining Amount Per Credit Card'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <CreditCardBalancePerAccountChart data={accounts} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={4} xl={4}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Remaining Amount Per Loan Account'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <LoanAccountBalancePerAccountChart data={accounts} />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Investment Per Fund'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <MutualFundInvestmentChart />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Contribution Per Financial Year'} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <ProvidentFundInvestmentChart />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader header={'Investment Per Stocks'} action={enlargeButton} />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <StocksInvestmentChart />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*    <Grid lg={6} xl={6}>*/}
                {/*        <Card className={'dashboard_chart_wrapper'} loading={isAllTransactionsDone}>*/}
                {/*            <CardHeader*/}
                {/*                header={'Investment Per Stock'}*/}
                {/*                action={*/}
                {/*                    <IconButton*/}
                {/*                        Icon={enlarge}*/}
                {/*                        onClick={(event) => {*/}
                {/*                            setFullViewChartComponent(<StockInvestmentChart />);*/}
                {/*                            setShowFullViewChart(true);*/}
                {/*                            setFullViewChartTitle('Investment Per Stock');*/}
                {/*                        }}*/}
                {/*                    />*/}
                {/*                }*/}
                {/*            />*/}
                {/*            <CardBody*/}
                {/*                style={{*/}
                {/*                    height: '76%',*/}
                {/*                    display: 'flex',*/}
                {/*                    justifyContent: 'center',*/}
                {/*                    alignItems: 'center'*/}
                {/*                }}*/}
                {/*            >*/}
                {/*                <StockInvestmentChart />*/}
                {/*            </CardBody>*/}
                {/*        </Card>*/}
                {/*    </Grid>*/}
                {/*</Grids>*/}
            </div>

            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setShowAddAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Account"
                hideAction
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getAccounts().then((response) => {
                                setAccounts(response.results);
                            });
                        } else {
                        }
                        setSelectedAccount(undefined);
                        setShowAddAccount(false);
                    }}
                />
            </Dialog>

            <Dialog
                open={showFullViewChart}
                onClose={() => {
                    setShowFullViewChart(false);
                    setFullViewChartComponent(undefined);
                    setFullViewChartTitle('');
                }}
                header={fullViewChartTitle}
                hideAction
                style={{
                    maxHeight: '100vh',
                    maxWidth: '100vw'
                }}
            >
                <div
                    style={{
                        height: '80vh',
                        width: '80vw'
                    }}
                >
                    {fullViewChartComponent}
                </div>
            </Dialog>
        </div>
    );
};

export default DashboardPage;
