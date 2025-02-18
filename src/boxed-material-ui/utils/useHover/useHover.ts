import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

function useHover<T extends HTMLElement>(): [RefObject<T>, boolean] {
    const [isHovered, setHovered] = useState(false);
    const ref = useRef<T>(null);
    const mouseEnterHandler = useCallback(() => setHovered(true), []);
    const mouseLeaveHandler = useCallback(() => setHovered(false), []);
    useEffect(() => {
        const element = ref.current;
        if (element) {
            element?.addEventListener('mouseenter', mouseEnterHandler);
            element?.addEventListener('mouseleave', mouseLeaveHandler);
        }
        return () => {
            element?.removeEventListener('mouseenter', mouseEnterHandler);
            element?.removeEventListener('mouseleave', mouseLeaveHandler);
        };
    }, []);
    return [ref, isHovered];
}

export default useHover;
