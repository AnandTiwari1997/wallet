import React, { ComponentPropsWithoutRef, FC, forwardRef } from 'react';
import { MenuOptionProps } from 'boxed-material-ui/modules/Menu/Menu.types';
import { Styled, useGenerateClassNames } from 'boxed-material-ui/styles';
import { clsx } from 'clsx';

const ROOT = Styled<ComponentPropsWithoutRef<'li'>>('li')(({ theme }) => {
    return {
        minHeight: `32px`,
        width: `100%`,
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        cursor: `pointer`,
        background: `transparent`,
        color: theme!.colors!.main,
        '&:hover': {
            textDecoration: `none`,
            backgroundColor: `rgba(0, 0, 0, 0.04)`
        }
    };
});

const MenuOption: FC<MenuOptionProps> = forwardRef(function MenuOption(inProps, ref) {
    const { label, className, onMenuOptionClick, onClick, ...rootProps } = inProps;
    const rootClassNames = useGenerateClassNames('menu', ['list-option']);
    return (
        <ROOT
            className={clsx(rootClassNames, className)}
            onClick={(event: any) => {
                event.stopPropagation();
                onClick && onClick(event);
                onMenuOptionClick && onMenuOptionClick(event);
            }}
            {...rootProps}
        >
            {label}
        </ROOT>
    );
});

export default MenuOption;
