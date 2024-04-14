import './select.css';
import React, { Fragment } from 'react';

export interface SelectOption {
    value: any;
    label: string;
}

type SelectProps = {
    options: SelectOption[];
    selectedOption: any;
} & React.ComponentPropsWithoutRef<'select'>;

const Select: React.FC<SelectProps> = ({ options, selectedOption, className, onChange, ...props }) => {
    return (
        <div className={['select', className].join(' ')}>
            <select onChange={onChange} value={selectedOption} {...props}>
                {options.map((option) => (
                    <Fragment>{option ? <option value={option.value}>{option.label}</option> : null}</Fragment>
                ))}
            </select>
        </div>
    );
};

export default Select;
