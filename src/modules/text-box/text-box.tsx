import './text-box.css';
import React from 'react';

type TextBoxProps = {} & React.ComponentPropsWithoutRef<'input'>;

const TextBox = ({ value, ...props }: TextBoxProps) => {
    return <input className="input" value={value} {...props} />;
};

export default TextBox;
