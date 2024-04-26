import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import App from './App';
import AccountPage from './pages/account/accounts';
import BillsPage from './pages/bills/bills';
import DashboardPage from './pages/dashboard/dashboard';
import ModuleTestPage from './pages/module-test/module-test';
import SavingsPage from './pages/savings/savings';
import StockPage from './pages/stocks/stocks';
import TransactionPage from './pages/transaction/transaction';
import reportWebVitals from './reportWebVitals';

const router = createHashRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/dashboard',
                index: true,
                element: <DashboardPage />
            },
            {
                path: '/account',
                index: false,
                element: <AccountPage />
            },
            {
                path: '/savings',
                index: false,
                element: <SavingsPage />
            },
            {
                path: '/stocks',
                index: false,
                element: <StockPage />
            },
            {
                path: '/transaction',
                index: false,
                element: <TransactionPage />
            },
            {
                path: '/bills',
                index: false,
                element: <BillsPage />
            },
            {
                path: '/module-test',
                index: false,
                element: <ModuleTestPage />
            }
        ]
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
