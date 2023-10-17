import * as React from 'react';
import Navigation from './modules/navigation/navigation';
import CSS from 'csstype';
import Header from './modules/header/header';
import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/dashboard/dashboard';
import TransactionPage from './pages/transaction/transaction';
import SavingsPage from './pages/savings/savings';
import AccountPage from './pages/account/accounts';
import BillsPage from './pages/bills/bills';

const mainStyle: CSS.Properties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgb(224, 224, 230)'
};

const mainStyle2: CSS.Properties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row'
};

const bodyStyle: CSS.Properties = {
    width: 'calc(100% - 13rem)'
};

const navigationStyle: CSS.Properties = {
    width: '13rem'
};

const body: CSS.Properties = {
    height: 'calc(100vh - 3rem)'
};

export const darkGreen = '#008000';
export const darkRed = '#FF0000';

const App = (): JSX.Element => {
    const [activeTab, setActiveTab] = React.useState('Dashboard');

    return (
        <div style={mainStyle}>
            <div style={mainStyle2}>
                <div style={navigationStyle}>
                    <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div style={bodyStyle}>
                    <Header heading={activeTab}></Header>
                    <div style={body}>
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route index path="/dashboard" element={<DashboardPage />} />
                            <Route index path="/account" element={<AccountPage />} />
                            <Route index path="/savings" element={<SavingsPage />} />
                            <Route index path="/transaction" element={<TransactionPage />} />
                            <Route index path="/bills" element={<BillsPage />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
