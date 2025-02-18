import { MutableRefObject, PropsWithChildren } from 'react';

export type PortalProps = {
    open?: boolean;
    container?: HTMLElement;
    containerRef?: MutableRefObject<HTMLElement>;
} & PropsWithChildren;
