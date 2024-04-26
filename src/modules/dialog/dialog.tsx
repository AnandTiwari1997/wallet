import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { close } from '../../icons/icons';
import './dailog.css';
import Overlay from '../overlay/overlay';

const Dialog = ({
    open,
    children,
    onBackdrop,
    onClose,
    header,
    noAction = false,
    onSubmit
}: {
    open: boolean;
    children: any;
    onBackdrop?: () => void;
    onClose: () => void;
    header: any;
    noAction?: boolean;
    onSubmit?: (...args: any) => void;
}) => {
    return (
        <Overlay
            trigger={null}
            open={open}
            onBackdrop={onBackdrop ? onBackdrop : onClose}
            parent={document.getElementsByTagName('body')[0]}
            backdropClass={'dialog-overlay-background'}
            containerClass={'dialog-overlay-container'}
        >
            <div className="dialog-content">
                <div className="dialog-header">
                    <div className="dialog-header-content">{header}</div>
                    <button className="dialog-header-close" onClick={onClose}>
                        <FontAwesomeIcon icon={close} />
                    </button>
                </div>
                <div className="dialog-body">{children}</div>
                {!noAction && (
                    <div className="dialog-footer">
                        <button className="button dialog-footer-action-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="button dialog-footer-secondary-button dialog-footer-action-button"
                            onClick={onSubmit}
                        >
                            Submit
                        </button>
                    </div>
                )}
            </div>
        </Overlay>
    );
};

export default Dialog;
