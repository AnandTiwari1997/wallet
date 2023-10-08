import Overlay from '../overlay/overlay';
import './menu.css';

const Menu = ({ open, menuFor, onClose, children }: { open: boolean; menuFor: string; onClose: () => void | any; children: any }) => {
    return (
        <Overlay open={open} onBackdrop={onClose} triggerBy={menuFor}>
            <div className="menu-list-container">
                <ul className="ul-menu-list">{children}</ul>
            </div>
        </Overlay>
    );
};

export default Menu;
