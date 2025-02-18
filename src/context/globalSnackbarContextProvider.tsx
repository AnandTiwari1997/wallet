import { Snackbar } from 'modules';
import { createContext, useReducer } from 'react';

export type SnackbarConfig = {
    open: boolean;
    message: string | null | undefined;
};

export const GlobalSnackbarContext = createContext<SnackbarConfig>({
    open: false,
    message: ''
});

export const GlobalSnackbarUpdateContext = createContext<any>(undefined);

const GlobalSnackbarContextProvider = ({ children }: { children: any }) => {
    const [snackbarConfig, setSnackbarConfig] = useReducer(
        (state: SnackbarConfig, newValue: SnackbarConfig) => newValue,
        {
            open: false,
            message: ''
        }
    );

    return (
        <GlobalSnackbarContext.Provider value={snackbarConfig}>
            <GlobalSnackbarUpdateContext.Provider value={setSnackbarConfig}>
                <Snackbar
                    open={snackbarConfig.open}
                    onClose={() => {
                        setSnackbarConfig({
                            open: false,
                            message: ''
                        });
                    }}
                    autoCloseDuration={5000}
                >
                    {snackbarConfig.message}
                </Snackbar>
                {children}
            </GlobalSnackbarUpdateContext.Provider>
        </GlobalSnackbarContext.Provider>
    );
};

export default GlobalSnackbarContextProvider;
