import CSS from 'csstype';
import * as React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './modules/header/header';
import Navigation from './modules/navigation/navigation';

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
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
