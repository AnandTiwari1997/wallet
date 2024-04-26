import './menu.css';
import React from 'react';

type MenuOptionProps = {
    label: string;
    onMenuOptionClick: (event: any) => void;
} & React.ComponentPropsWithoutRef<'li'>;

const MenuOption = ({ label, onMenuOptionClick, ...props }: MenuOptionProps) => {
    return (
        <li className="li-menu-list" {...props} onClick={onMenuOptionClick}>
            {label}
        </li>
    );
};

export default MenuOption;
