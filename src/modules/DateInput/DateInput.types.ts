import { ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';

export type DateInputProps = {
    value?: Date | string | number;
    format?: string;
    onInputChange?: (date: Date) => void;
} & ComponentPropsWithRef<'div'> &
    ComponentPropsWithoutRef<'input'>;
