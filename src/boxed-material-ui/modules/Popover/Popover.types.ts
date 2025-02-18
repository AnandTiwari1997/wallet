import { ExcludedComponentPropsWithoutRef } from '../index';
import { Placement, Strategy } from '@floating-ui/dom';
import { OffsetOptions } from '@floating-ui/core/src/middleware/offset';
import { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type PopoverContainerProps = ExcludedComponentPropsWithoutRef<'div', 'className'>;

export type PopoverProps = {
    open: boolean;
    anchorElement?: HTMLElement | null;
    parent?: HTMLElement;
    closeOnClickOutside?: boolean;
    onClose?: () => void;
    childProps?: {
        container?: PopoverContainerProps;
    };
    childClasses?: {
        container?: string;
    };
    placement?: Placement;
    position?: Strategy;
    offset?: OffsetOptions;
} & PropsWithChildren &
    ComponentPropsWithRef<'div'>;
