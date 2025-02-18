import { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type BackdropProps = {
    disabled?: boolean;
    allowBackdropEffect?: boolean;
    onClickOutSide?: () => void;
} & PropsWithChildren &
    ComponentPropsWithRef<'div'>;
