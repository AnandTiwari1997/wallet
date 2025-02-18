import { GlobalSnackbarContext, GlobalSnackbarUpdateContext } from 'context/globalSnackbarContextProvider';
import { useContext } from 'react';

function useSnackbar() {
    return [useContext(GlobalSnackbarContext), useContext(GlobalSnackbarUpdateContext)];
}

export default useSnackbar;
