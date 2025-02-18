import 'App.css';
import GlobalSnackbarContextProvider from 'context/globalSnackbarContextProvider';
import CSS from 'csstype';
import { Grid, Grids } from 'modules';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Header from 'shared/header/Header';
import Navigation from 'shared/navigation/navigation';

const mainStyle: CSS.Properties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    background: 'rgb(224, 224, 230)'
};

const navigationStyle: CSS.Properties = {
    minWidth: '4rem',
    maxWidth: '14rem'
};

const body: CSS.Properties = {
    height: 'calc(100vh - 3rem)'
};

export const darkGreen = '#008000';
export const darkRed = '#FF0000';

const App = (): JSX.Element => {
    const [activeTab, setActiveTab] = React.useState<string>('Dashboard');
    const [bodyWidth, setBodyWidth] = React.useState<string>('4rem');

    return (
        <GlobalSnackbarContextProvider>
            <div style={mainStyle}>
                <div style={navigationStyle}>
                    <Navigation
                        active={activeTab}
                        onNavigation={(state) => setActiveTab(state.current)}
                        onPanelChange={(state) => {
                            if (state.collapsed) {
                                setBodyWidth(`14rem`);
                            } else {
                                setBodyWidth(`4rem`);
                            }
                        }}
                    />
                </div>
                <div
                    style={{
                        width: `calc(100% - ${bodyWidth})`,
                        transition: `all 0.25s ease 0s`
                    }}
                >
                    <Grids>
                        <Grid>
                            <Header>
                                <div className={'title'}>{activeTab}</div>
                            </Header>
                        </Grid>
                        <Grid style={body}>
                            <Outlet />
                        </Grid>
                    </Grids>
                </div>
            </div>
        </GlobalSnackbarContextProvider>
    );
};

export default App;
