import 'index.css';
import 'boxed-material-ui.css';
import AccountPage from 'pages/account/accounts';
import BillsPage from 'pages/bills/bills';
import DashboardPage from 'pages/dashboard/dashboard';
import ModuleTestPage from 'pages/module-test/module-test';
import SavingsPage from 'pages/savings/savings';
import StockPage from 'pages/stocks/stocks';
import TransactionPage from 'pages/transaction/transaction';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index path="/dashboard" element={<DashboardPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/transaction" element={<TransactionPage />} />
                    <Route path="/bills" element={<BillsPage />} />
                    <Route path="/savings" element={<SavingsPage />} />
                    <Route path="/stocks" element={<StockPage />} />
                    <Route path="/module-test" element={<ModuleTestPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
