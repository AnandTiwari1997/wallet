import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

function useFocus<T extends HTMLElement>(): [RefObject<T>, boolean] {
    const [isFocused, setFocused] = useState(false);
    const ref = useRef<T>(null);
    const focusHandler = useCallback(() => setFocused(true), []);
    const blurHandler = useCallback(() => setFocused(false), []);
    useEffect(() => {
        const element = ref.current;
        if (element) {
            element?.addEventListener('focus', focusHandler);
            element?.addEventListener('blur', blurHandler);
        }
        return () => {
            element?.removeEventListener('focus', focusHandler);
            element?.removeEventListener('blur', blurHandler);
        };
    }, []);
    return [ref, isFocused];
}

export default useFocus;
