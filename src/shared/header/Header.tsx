import { Styled } from 'boxed-material-ui/styles';
import * as React from 'react';
import { ComponentProps, PropsWithChildren } from 'react';

type HeaderProps = ComponentProps<'div'> & PropsWithChildren;

const ROOT = Styled<HeaderProps>('div')((styles) => {
    return {
        display: `flex`,
        backgroundColor: `rgb(34, 52, 60)`,
        color: `rgb(255, 255, 255)`,
        whiteSpace: `nowrap`,
        height: `3rem`,
        top: `0px`,
        left: `0px`,
        right: `0px`,
        zIndex: `800`,
        width: `100%`,
        alignItems: `center`,
        justifyContent: `center`
    };
});

const Header = ({ children, ...props }: HeaderProps) => {
    return <ROOT {...props}>{children}</ROOT>;
};

export default Header;
