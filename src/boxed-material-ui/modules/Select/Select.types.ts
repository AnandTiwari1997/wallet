import React, { CSSProperties } from 'react';

export interface SelectOption {
    value: any;
    label: string;
}

export interface Selected {
    selected?: boolean;
}

export type SelectProps = {
    showLabel?: boolean;
    label?: string;
    placeholder?: string;
    loading?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    options?: SelectOption[];
    disabled?: boolean;
    spotClasses?: {
        root?: string;
        label?: string;
        container?: string;
        optionRoot?: string;
        optionContainer?: string;
    };
    opened?: boolean;
    spotStyles?: {
        root?: CSSProperties;
        label?: CSSProperties;
        container?: CSSProperties;
        optionRoot?: CSSProperties;
        optionContainer?: CSSProperties;
    };
    selectedOption?: any;
    onSelectionChange?: (selectedOption: SelectOption) => void;
} & Omit<React.DetailsHTMLAttributes<HTMLDivElement>, 'onChange'> &
    React.DetailsHTMLAttributes<HTMLDivElement> &
    React.RefAttributes<HTMLDivElement>;
