import { accounts, bills, dashboard, savings, stocks, transactions } from 'icons/icons';
import { IconButton } from 'modules';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationItemList = (props: any) => {
    const { active, show = 'logo', onNavigation } = props;
    const activeTabClassName = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
        return `css-Navigation-Item-${isActive ? 'Active' : 'Non-Active'}`;
    };
    const [currentLink, setCurrentLink] = React.useState<string>(active);
    return (
        <ul>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Dashboard', previous: currentLink });
                        setCurrentLink('Dashboard');
                    }}
                    to="/dashboard"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={dashboard}
                        />
                    ) : (
                        <span>Dashboard</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Account', previous: currentLink });
                        setCurrentLink('Account');
                    }}
                    to="/account"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={accounts}
                        />
                    ) : (
                        <span>Account</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Transaction', previous: currentLink });
                        setCurrentLink('Transaction');
                    }}
                    to="/transaction"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={transactions}
                        />
                    ) : (
                        <span>Transaction</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Bills', previous: currentLink });
                        setCurrentLink('Bills');
                    }}
                    to="/bills"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={bills}
                        />
                    ) : (
                        <span>Bills</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Savings', previous: currentLink });
                        setCurrentLink('Savings');
                    }}
                    to="/savings"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={savings}
                        />
                    ) : (
                        <span>Savings</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Stocks', previous: currentLink });
                        setCurrentLink('Stocks');
                    }}
                    to="/stocks"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={stocks}
                        />
                    ) : (
                        <span>Stocks</span>
                    )}
                </NavLink>
            </li>
            <li>
                <NavLink
                    tabIndex={0}
                    className={activeTabClassName}
                    onClick={(event) => {
                        event.stopPropagation();
                        onNavigation({ current: 'Module Test', previous: currentLink });
                        setCurrentLink('Module Test');
                    }}
                    to="/module-test"
                >
                    {show === 'logo' ? (
                        <IconButton
                            svgProps={{
                                height: `16px`,
                                width: `16px`
                            }}
                            icon={dashboard}
                        />
                    ) : (
                        <span>Module Test</span>
                    )}
                </NavLink>
            </li>
        </ul>
    );
};

export default NavigationItemList;
