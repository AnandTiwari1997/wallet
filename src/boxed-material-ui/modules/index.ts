import { ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';

export * from 'boxed-material-ui/modules/Backdrop';
export * from 'boxed-material-ui/modules/Badge';
export * from 'boxed-material-ui/modules/Button';
export * from 'boxed-material-ui/modules/CalenderPicker';
export * from 'boxed-material-ui/modules/Card';
export * from 'boxed-material-ui/modules/Icon';
export * from 'boxed-material-ui/modules/IconButton';
export * from 'boxed-material-ui/modules/InputField';
export * from 'boxed-material-ui/modules/Menu';
export * from 'boxed-material-ui/modules/Popover';
export * from 'boxed-material-ui/modules/Portal';
export * from 'boxed-material-ui/modules/Ripple';
export * from 'boxed-material-ui/modules/Overlay';
export * from 'boxed-material-ui/modules/Select';

export type ExcludedComponentPropsWithoutRef<
    T extends keyof JSX.IntrinsicElements,
    K extends keyof ComponentPropsWithoutRef<T> | ''
> = Omit<ComponentPropsWithoutRef<T>, K>;
export type ExcludedComponentPropsWithRef<
    T extends keyof JSX.IntrinsicElements,
    K extends keyof ComponentPropsWithRef<T> | ''
> = Omit<ComponentPropsWithRef<T>, K>;
