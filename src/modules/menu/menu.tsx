import Overlay from '../overlay/overlay';
import './menu.css';
import { useRef } from 'react';

const Menu = ({ open, menuFor, onClose, children }: { open: boolean; menuFor: string; onClose: () => void | any; children: any }) => {
    const ref = useRef();
    return (
        <Overlay open={open} onBackdrop={onClose} triggerBy={menuFor}>
            <div className="menu-list-container">
                <ul className="ul-menu-list" onClick={onClose}>
                    {children}
                </ul>
            </div>
        </Overlay>
    );
};

export default Menu;
