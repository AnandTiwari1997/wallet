import { ComponentPropsWithoutRef, ComponentPropsWithRef, PropsWithChildren, RefObject } from 'react';
import { ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';

export type MenuListProps = ExcludedComponentPropsWithoutRef<'ul', 'className'>;

export type MenuOptionProps = {
    label: string;
    onMenuOptionClick?: (event: any) => void;
} & ComponentPropsWithoutRef<'li'>;

export type MenuProps = {
    open: boolean;
    menuFor: string | RefObject<HTMLElement>;
    onOpen?: () => void;
    onClose?: () => void;
    childProps?: {
        menuList?: MenuListProps;
    };
    childClasses?: {
        menuList?: string;
    };
} & PropsWithChildren &
    ComponentPropsWithRef<'div'>;
