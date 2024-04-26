import './menu.css';
import React, { Fragment } from 'react';

import Overlay from '../overlay/overlay';

type MenuProps = {
    open: boolean;
    menuFor: string;
    onClose: () => void;
    containerClass?: string;
    children: React.ReactNode[];
} & React.ComponentPropsWithoutRef<'ul'>;

const Menu = ({ open, menuFor, onClose, children, ...props }: MenuProps) => {
    return (
        <Fragment>
            {open && (
                <Overlay
                    trigger={document.querySelector('[id=' + menuFor + ']')}
                    open={open}
                    onBackdrop={onClose}
                    parent={document.getElementsByTagName('body')[0]}
                >
                    <div className="menu-list-container" id="menu-container">
                        <ul className="ul-menu-list" {...props} onClick={onClose}>
                            {children}
                        </ul>
                    </div>
                </Overlay>
            )}
        </Fragment>
    );
};

export default Menu;
