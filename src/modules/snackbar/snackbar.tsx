import React, { ComponentPropsWithoutRef, CSSProperties, PropsWithChildren, useEffect, useState } from 'react';
import './snackbar.css';

type SnackBarProp = {
    open: boolean;
    onClose: () => void;
    anchorOrigin?: {
        horizontal: 'center' | 'left' | 'right';
        vertical: 'bottom' | 'top';
    };
    autoCloseDuration?: number;
} & PropsWithChildren &
    ComponentPropsWithoutRef<'div'>;

const Snackbar = ({
    children,
    open,
    onClose,
    autoCloseDuration,
    anchorOrigin = { horizontal: 'center', vertical: 'bottom' },
    ...props
}: SnackBarProp) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const [style, setStyle] = useState<CSSProperties>();

    useEffect(() => {
        if (!open) {
            return;
        }
        setIsOpen(open);
        const newStyle: CSSProperties = {
            position: 'fixed',
            zIndex: 1000,
            transform: ''
        };
        if (anchorOrigin.horizontal === 'left') {
            newStyle.left = '0';
            newStyle.transform += ' translateX(24px)';
        } else if (anchorOrigin.horizontal === 'right') {
            newStyle.right = '0';
            newStyle.transform += ' translateX(-24px)';
        } else if (anchorOrigin.horizontal === 'center') {
            newStyle.left = '50%';
            newStyle.transform += ' translateX(-50%)';
        }

        if (anchorOrigin.vertical === 'bottom') {
            newStyle.bottom = '0';
            newStyle.transform += ' translateY(-24px)';
        } else if (anchorOrigin.vertical === 'top') {
            newStyle.top = '0';
            newStyle.transform += ' translateY(24px)';
        }
        setStyle(newStyle);

        const keyHandler = (e: any) => {
            if ([27].indexOf(e.which) >= 0) {
                setIsOpen(false);
                if (onClose) {
                    onClose();
                }
            }
        };
        const clickHandler = (e: any) => {
            setIsOpen(false);
            if (onClose) {
                onClose();
            }
        };
        window.addEventListener('keyup', keyHandler);
        window.addEventListener('click', clickHandler);

        if (autoCloseDuration && autoCloseDuration > 0) {
            setTimeout(() => {
                setIsOpen(false);
            }, autoCloseDuration);
        }

        return () => {
            window.removeEventListener('keyup', keyHandler);
            window.removeEventListener('click', clickHandler);
        };
    }, [open]);

    return (
        <>
            {isOpen && (
                <div style={style}>
                    <div
                        style={{
                            opacity: '1',
                            transform: 'none',
                            transition:
                                'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
                        }}
                        className={'snackbar-container'}
                    >
                        <div
                            style={{
                                padding: '8px 0px'
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default Snackbar;
