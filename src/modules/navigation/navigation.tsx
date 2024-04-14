import * as React from 'react';
import { NavLink } from 'react-router-dom';
import './navigation.css';

const Navigation = ({ activeTab, setActiveTab }: { [key: string]: any }) => {
    const activeTabClassName = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) => {
        return `css-Navigation-Item-${isActive ? 'Active' : 'Non-Active'}`;
    };
    return (
        <nav aria-label="Left side" id="leftNav" className="css-Navigation">
            <ul className="css-Navigation-list">
                <li>
                    <NavLink
                        relative={'route'}
                        reloadDocument={true}
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Dashboard')}
                        to="/dashboard"
                    >
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        relative={'route'}
                        tabIndex={0}
                        reloadDocument={true}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Account')}
                        to="/account"
                    >
                        <span>Account</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Transaction')}
                        to="/transaction"
                    >
                        <span>Transaction</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Bills')}
                        to="/bills"
                    >
                        <span>Bills</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Savings')}
                        to="/savings"
                    >
                        <span>Savings</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Stocks')}
                        to="/stocks"
                    >
                        <span>Stocks</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        tabIndex={0}
                        className={activeTabClassName}
                        onClick={() => setActiveTab('Statistics')}
                        to="/statistics"
                    >
                        <span>Statistics</span>
                    </NavLink>
                </li>
            </ul>
            <button aria-label="Side navigation expand/collapse" className="css-Navigation-Collapse-Button">
                <span>Collapse</span>
            </button>
        </nav>
    );
};

export default Navigation;
