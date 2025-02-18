import React, { forwardRef, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { PopoverContainerProps, PopoverProps } from 'boxed-material-ui/modules/Popover/Popover.types';
import { Portal } from 'boxed-material-ui/modules/Portal';
import { useSanitizeProp } from 'boxed-material-ui/utils';
import { Styled, useGenerateClassNames } from 'boxed-material-ui/styles';

const ROOT = Styled<PopoverProps>('div')({
    opacity: `0`,
    position: `relative`
});

const CONTAINER = Styled<PopoverContainerProps>('div')({
    position: 'absolute'
});

const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(inProps, ref) {
    const {
        open,
        parent,
        children,
        className,
        childProps,
        childClasses,
        anchorElement,
        placement = 'bottom',
        position = 'absolute',
        offset,
        closeOnClickOutside = true,
        onClose,
        ...overlayProps
    } = inProps;
    const { container: containerProps } = useSanitizeProp(childProps, {
        container: {}
    });
    const { container: containerClass } = useSanitizeProp(childClasses, {
        container: ''
    });
    const updatePositionOptions = {
        animationFrame: true
    };

    const [shouldOpen, setShouldOpen] = useState<boolean>(open);
    const virtualElement = useRef<HTMLDivElement>(null);
    const rootElement = document.querySelector('#root');
    const keyHandler = useCallback((e: any) => [27].indexOf(e.which) >= 0 && onClose && onClose(), [onClose]);
    const clickHandler = (event) => {
        setShouldOpen(false);
        onClose && onClose();
    };

    // const updatePosition = useCallback(
    //     (anchorElement: HTMLElement, popover: HTMLElement) => {
    //         computePosition(anchorElement, popover, {
    //             placement: placement,
    //             strategy: position,
    //             middleware: [
    //                 flip({
    //                     mainAxis: true,
    //                     crossAxis: true
    //                 }),
    //                 offsetPosition(offset)
    //             ]
    //         }).then((computePositionReturn: ComputePositionReturn) => {
    //             Object.assign(popover.style, {
    //                 width: `${anchorElement.offsetWidth}px`,
    //                 opacity: 1,
    //                 left: `${computePositionReturn.x}px`,
    //                 top: `${computePositionReturn.y}px`,
    //                 position: `${computePositionReturn.strategy}`,
    //                 transform: `none`,
    //                 transformOrigin: `0px 0px`
    //             });
    //         });
    //     },
    //     [anchorElement]
    // );

    useEffect(() => {
        if (!open) {
            return;
        }
        setShouldOpen(true);
        const popover = virtualElement.current;
        if (!popover || !anchorElement) {
            return () => {
                if (rootElement) {
                    rootElement.removeAttribute('inert');
                }
                window.removeEventListener('keyup', keyHandler);
            };
        }
        // const cleanup = autoUpdate(
        //     anchorElement,
        //     popover,
        //     () => updatePosition(anchorElement, popover),
        //     updatePositionOptions
        // );
        return () => {
            // cleanup();
            setShouldOpen(false);
        };
    }, [open, anchorElement, placement, position]);

    useEffect(() => {
        if (closeOnClickOutside) {
            window.addEventListener('click', clickHandler);
        }
        return () => {
            window.removeEventListener('click', clickHandler);
        };
    }, [closeOnClickOutside, onClose]);

    const rootClassNames = useGenerateClassNames('popover', ['root']);
    const containerClassNames = useGenerateClassNames('popover', ['container']);

    return (
        <Portal open={shouldOpen} container={parent}>
            <ROOT
                ref={virtualElement}
                open={shouldOpen}
                anchorElement={anchorElement}
                parent={parent}
                className={clsx(rootClassNames, className)}
                {...overlayProps}
            >
                <CONTAINER className={clsx(containerClassNames, containerClass)} {...containerProps}>
                    {React.cloneElement(children as ReactElement, {})}
                </CONTAINER>
            </ROOT>
        </Portal>
    );
});

export default Popover;
