import React, { ComponentPropsWithRef } from 'react';

export type StateProps = {
    active?: boolean;
    focused?: boolean;
    hovered?: boolean;
};

export type InputFieldProps = {
    showLabel?: boolean;
    label?: string;
    showHint?: boolean;
    hint?: string;
    color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning' | 'info';
    appearance?: 'ghost' | 'outlined';
    prefixes?: React.ReactNode[];
    suffixes?: React.ReactNode[];
} & ComponentPropsWithRef<'input'>;
