import { Placement, Strategy } from '@floating-ui/dom';
import { ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';
import { ComponentPropsWithRef, PropsWithChildren } from 'react';
import { OffsetOptions } from '@floating-ui/core/src/middleware/offset';

export type OverlayBackdropProps = ExcludedComponentPropsWithoutRef<'div', 'className'>;
export type OverlayContainerProps = ExcludedComponentPropsWithoutRef<'div', 'className'>;

export type OverlayProps = {
    open: boolean;
    anchorElement?: HTMLElement | null;
    parent?: HTMLElement;
    allowBackdrop?: boolean;
    onBackdrop?: () => any;
    childProps?: {
        backdrop?: OverlayBackdropProps;
        container?: OverlayContainerProps;
    };
    childClasses?: {
        backdrop?: string;
        container?: string;
    };
    placement?: Placement;
    position?: Strategy;
    offset?: OffsetOptions;
} & PropsWithChildren &
    ComponentPropsWithRef<'div'>;
