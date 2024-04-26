import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CSS from 'csstype';
import React, { useState } from 'react';
import './checkbox.css';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';

type CheckboxProps = {
    indeterminate?: boolean;
    label?: string;
    customStyles?: string;
    customLabelStyles?: string;
} & React.ComponentPropsWithoutRef<'input'>;

const iconStyle: CSS.Properties = {
    width: '100%',
    height: '100%',
    lineHeight: 'inherit',
    color: 'rgb(34, 52, 60)'
};

const uncheckedIcon = <FontAwesomeIcon icon={faSquare} style={iconStyle} className="icon" />;
const checkedIcon = <FontAwesomeIcon icon={faCheckSquare} style={iconStyle} className="icon" />;
const indeterminateIcon = <FontAwesomeIcon icon={faMinusSquare} style={iconStyle} className="icon" />;

const Checkbox = ({
    indeterminate = false,
    checked,
    label,
    customStyles,
    customLabelStyles,
    ...props
}: CheckboxProps) => {
    const defaultChecked = checked ? checked : false;
    const [isChecked, setIsChecked] = useState(defaultChecked);
    return (
        <label className={['checkbox-wrapper', customLabelStyles].join(' ')}>
            <span className={['checkbox-wrapper-span', customStyles].join(' ')}>
                <input
                    type={'checkbox'}
                    checked={isChecked}
                    {...props}
                    onChange={(event) => {
                        setIsChecked(!isChecked);
                        if (props['onChange']) {
                            props['onChange'](event);
                        }
                    }}
                />
                <div className={'checkbox-wrapper-icons'}>
                    {indeterminate ? indeterminateIcon : checked ? checkedIcon : uncheckedIcon}
                </div>
            </span>
            {label && <span>{label}</span>}
        </label>
    );
};

export default Checkbox;
