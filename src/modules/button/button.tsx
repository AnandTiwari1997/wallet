import './button.css';
import React from 'react';

type ButtonProps = {
    children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'button'>;

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <button className="button" {...props}>
            {children}
        </button>
    );
};

export default Button;
