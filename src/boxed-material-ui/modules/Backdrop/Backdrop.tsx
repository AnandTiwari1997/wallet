import { BackdropProps } from 'boxed-material-ui/modules';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import clsx from 'clsx';
import React, { forwardRef } from 'react';

const ROOT = Styled<BackdropProps>('div')(({ allowBackdropEffect }) => {
    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: `center`,
        position: `fixed`,
        right: `0`,
        bottom: `0`,
        top: `0`,
        left: `0`,
        ...(allowBackdropEffect && {
            opacity: `1`,
            transition: `opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
            transitionDelay: `200ms`
        })
    };
});

const Backdrop = forwardRef<HTMLDivElement, BackdropProps>((inProps, ref) => {
    const { children, className, disabled, onClick, onClickOutSide, allowBackdropEffect = true, ...others } = inProps;
    const classNames = useGenerateClassNames('backdrop', ['root']);
    return (
        <React.Fragment>
            {disabled ? (
                <></>
            ) : (
                <ROOT
                    className={clsx(classNames, className)}
                    onClick={onClick ? onClick : onClickOutSide}
                    allowBackdropEffect={allowBackdropEffect}
                    {...others}
                />
            )}
            {children}
        </React.Fragment>
    );
});

export default Backdrop;
