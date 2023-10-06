import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const globalStateContext = React.createContext(true);
const dispatchStateContext = React.createContext<any>(undefined);

const GlobalLoadingStateProvider = ({ children }: { children: any }) => {
    const [state, dispatch] = React.useReducer((state: any, newValue: boolean) => newValue, false);
    return (
        <globalStateContext.Provider value={state}>
            <dispatchStateContext.Provider value={dispatch}>{children}</dispatchStateContext.Provider>
        </globalStateContext.Provider>
    );
};

export const useGlobalLoadingState = () => [React.useContext(globalStateContext), React.useContext(dispatchStateContext)];

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <GlobalLoadingStateProvider>
                <App />
            </GlobalLoadingStateProvider>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
