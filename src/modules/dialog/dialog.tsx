import { close } from '../../icons/icons';
import './dailog.css';
import Overlay from '../../boxed-material-ui/modules/Overlay/Overlay';

import { ComponentPropsWithoutRef } from 'react';

import { Icon } from '../icon';

type DialogProp = {
    open: boolean;
    children: any;
    onBackdrop?: () => void;
    onClose?: () => void;
    header?: any;
    hideAction?: boolean;
    onSubmit?: (...args: any) => void;
} & ComponentPropsWithoutRef<'div'>;

const Dialog = ({
    open,
    children,
    onBackdrop,
    onClose,
    header,
    hideAction = false,
    onSubmit,
    ...props
}: DialogProp) => {
    return (
        <Overlay
            anchorElement={null}
            open={open}
            onBackdrop={onBackdrop ? onBackdrop : onClose ? onClose : () => console.log('Clicked')}
            parent={document.getElementsByTagName('body')[0]}
            childClasses={{
                backdrop: 'dialog-overlay-background',
                container: 'dialog-overlay-container'
            }}
        >
            <div {...props} className={`dialog-content ${props.className ? props.className : ''}`}>
                <div className="dialog-header">
                    <div className="dialog-header-content">{header}</div>
                    <button className="dialog-header-close" onClick={onClose}>
                        <Icon
                            icon={close}
                            svgProps={{
                                height: '16px',
                                width: '16px'
                            }}
                        />
                    </button>
                </div>
                <div className="dialog-body">{children}</div>
                {!hideAction && (
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
