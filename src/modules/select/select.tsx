import './select.css';
import React from 'react';

export interface SelectOption {
    value: any;
    label: string;
}

type SelectProps = {
    options: SelectOption[];
    selectedOption: any;
} & React.ComponentPropsWithoutRef<'select'>;

const Select: React.FC<SelectProps> = ({ options, selectedOption, ...props }) => {
    return (
        <div className="select">
            <select onChange={props['onChange']} value={selectedOption}>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default Select;
