import './menu.css';
import { MouseEventHandler } from 'react';

const MenuOption = ({
    label,
    onMenuOptionClick,
    ...props
}: {
    label: string;
    onMenuOptionClick?: MouseEventHandler<HTMLLIElement>;
}) => {
    return (
        <li className="li-menu-list" onClick={onMenuOptionClick} {...props}>
            {label}
        </li>
    );
};

export default MenuOption;
