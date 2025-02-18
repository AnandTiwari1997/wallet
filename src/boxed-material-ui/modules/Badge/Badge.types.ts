import { ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';
import { ComponentPropsWithRef, PropsWithChildren, ReactNode } from 'react';

export type BadgeLabelProps = ExcludedComponentPropsWithoutRef<'span', 'className'> & { anchorOrigin?: BadgePosition };

export type BadgePosition = {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'left' | 'right' | 'center';
};

export type BadgeProps = {
    badgeContent?: ReactNode;
    anchorOrigin?: BadgePosition;
    childProps?: {
        label?: BadgeLabelProps;
    };
    childClasses?: {
        label?: string;
    };
} & PropsWithChildren &
    ComponentPropsWithRef<'span'>;
