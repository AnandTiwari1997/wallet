import './select.css';
import { ChangeEventHandler } from 'react';

export interface SelectOption {
    value: any;
    label: string;
}

const Select = ({ options, onChange }: { options: SelectOption[]; onChange: ChangeEventHandler<HTMLSelectElement> | undefined }) => {
    return (
        <div className="select">
            <select onChange={onChange}>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default Select;
