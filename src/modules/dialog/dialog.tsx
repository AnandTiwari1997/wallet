import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { close } from '../../icons/icons';
import DialogOverlay from '../overlay/dialog-overlay';
import './dailog.css';

const Dialog = ({ open, children, onBackdrop, onClose, header }: { open: boolean; children: any; onBackdrop?: () => void; onClose: () => void; header: any }) => {
    useEffect(() => {}, []);

    return (
        <DialogOverlay open={open} onBackdrop={onBackdrop ? onBackdrop : onClose}>
            <div className="dialog-content">
                <div className="dialog-header">
                    <div className="dialog-header-content">{header}</div>
                    <button className="dialog-header-close" onClick={onClose}>
                        <FontAwesomeIcon icon={close} />
                    </button>
                </div>
                <div className="dialog-body">{children}</div>
            </div>
        </DialogOverlay>
    );
};

export default Dialog;
