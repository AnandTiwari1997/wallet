import { ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';
import React, { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type ButtonLabelProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & ExcludedComponentPropsWithoutRef<'span', 'className'>;

export type ButtonProps = {
    text?: string;
    color?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning' | 'info';
    appearance?: 'ghost' | 'filled';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    clickEffect?: 'wave' | 'pulse' | 'none';
    childProps?: {
        label?: ButtonLabelProps;
    };
    childClasses?: {
        label?: string;
    };
} & PropsWithChildren &
    ComponentPropsWithRef<'button'>;
