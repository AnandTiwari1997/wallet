import './menu.css';

const MenuOption = ({ label, ...props }: { label: string }) => {
    return (
        <li className="li-menu-list" {...props}>
            {label}
        </li>
    );
};

export default MenuOption;
