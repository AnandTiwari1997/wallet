import React, { ComponentPropsWithoutRef, forwardRef, Fragment, useEffect } from 'react';
import { Overlay } from 'boxed-material-ui/modules';
import { MenuListProps, MenuProps } from 'boxed-material-ui/modules/Menu/Menu.types';
import { Styled, useGenerateClassNames } from 'boxed-material-ui/styles';
import { clsx } from 'clsx';
import { useSanitizeProp } from 'boxed-material-ui/utils';

const ROOT = Styled<ComponentPropsWithoutRef<'div'>>('div')(({ theme }) => {
    return {
        display: `block`,
        minWidth: `90px`,
        backgroundColor: `white`,
        color: 'black',
        fontFamily: `Roboto, Helvetica, Arial, sans-serif`,
        fontSize: `0.875rem`,
        boxShadow: theme!.shadows!.lowFloatingShadow
    };
});

const LIST = Styled<MenuListProps>('ul')({
    width: `100%`,
    margin: `0`,
    display: `flex`,
    flexDirection: `column`,
    justifyContent: `center`,
    alignItems: `center`,
    listStyle: `none`,
    padding: `10px 0`
});

const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(inProps, ref) {
    const { className, childProps, childClasses, open, menuFor, onOpen, onClose, children, ...rootProps } = inProps;
    const [trigger, setTrigger] = React.useState<HTMLElement | null>();
    const [shouldOpen, setShouldOpen] = React.useState<boolean>(open);

    const { menuList: menuListProps } = useSanitizeProp(childProps, { menuList: {} });
    const { menuList: menuListClasses } = useSanitizeProp(childClasses, { menuList: '' });

    useEffect(() => {
        if (onOpen) {
            onOpen();
        }
        if (typeof menuFor === 'string') {
            const triggerElement = document.getElementById(menuFor);
            if (!triggerElement) {
                setShouldOpen(false);
                return;
            }
            setTrigger(triggerElement);
        } else {
            if (!menuFor.current) {
                setShouldOpen(false);
                return;
            }
            setTrigger(menuFor!.current);
        }
        setShouldOpen(open);
    }, [open, menuFor]);

    const rootClassNames = useGenerateClassNames('menu', ['root']);
    const menuListClassNames = useGenerateClassNames('menu', ['list']);

    return (
        <Fragment>
            {shouldOpen && trigger && (
                <Overlay
                    anchorElement={trigger}
                    open={shouldOpen}
                    placement={'bottom-start'}
                    offset={{
                        mainAxis: 2
                    }}
                    onBackdrop={() => {
                        setShouldOpen(false);
                        onClose && onClose();
                    }}
                    parent={document.getElementsByTagName('body')[0]}
                >
                    <ROOT id={`menu-container-${menuFor}`} className={clsx(rootClassNames, className)} {...rootProps}>
                        <LIST className={clsx(menuListClassNames, menuListClasses)} {...menuListProps}>
                            {children}
                        </LIST>
                    </ROOT>
                </Overlay>
            )}
        </Fragment>
    );
});

export default Menu;
