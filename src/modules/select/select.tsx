import './select.css';
import { ChangeEventHandler } from 'react';

export interface SelectOption {
    value: any;
    label: string;
}

const Select = ({ options, onChange, selectedOption }: { options: SelectOption[]; onChange: ChangeEventHandler<HTMLSelectElement> | undefined; selectedOption?: any }) => {
    return (
        <div className="select">
            <select onChange={onChange} value={selectedOption}>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default Select;
