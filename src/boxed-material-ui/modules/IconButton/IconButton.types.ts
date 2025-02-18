import { IconProps } from '../Icon';
import { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type IconButtonProps = {
    color?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning' | 'info';
    appearance?: 'ghost' | 'filled';
    clickEffect?: 'wave' | 'pulse' | 'none';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    iconProps?: IconProps;
} & PropsWithChildren &
    ComponentPropsWithRef<'button'>;
