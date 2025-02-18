import { autoUpdate, computePosition, ComputePositionReturn, flip, offset as offsetPosition } from '@floating-ui/dom';
import { Backdrop } from 'boxed-material-ui/modules/Backdrop';
import { OverlayContainerProps, OverlayProps } from 'boxed-material-ui/modules/Overlay/Overlay.types';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import clsx from 'clsx';
import React, { forwardRef, ReactElement, useCallback, useEffect, useRef } from 'react';
import { useSanitizeProp } from 'boxed-material-ui/utils';
import { Portal } from 'boxed-material-ui/modules/Portal';

const ROOT = Styled<OverlayProps>('div')({
    position: `fixed`,
    zIndex: `1300`,
    right: `0`,
    bottom: `0`,
    top: `0`,
    left: `0`
});

const CONTAINER = Styled<OverlayContainerProps>('div')({
    transition: `opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
    opacity: `1`
});

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(function Overlay(inProps, ref) {
    const {
        open,
        parent,
        children,
        onBackdrop,
        className,
        childProps,
        childClasses,
        anchorElement,
        allowBackdrop = true,
        placement = 'bottom',
        position = 'absolute',
        offset,
        ...overlayProps
    } = inProps;
    const { backdrop: backdropProps, container: containerProps } = useSanitizeProp(childProps, {
        backdrop: {},
        container: {}
    });
    const { backdrop: backdropClass, container: containerClass } = useSanitizeProp(childClasses, {
        backdrop: '',
        container: ''
    });

    const backdrop = useRef<HTMLDivElement>(null);
    const virtualElement = useRef<HTMLDivElement>(null);
    const keyHandler = useCallback((e: any) => [27].indexOf(e.which) >= 0 && onBackdrop && onBackdrop(), [onBackdrop]);
    const rootElement = document.querySelector('#root');

    const updatePositionOptions = {
        animationFrame: true
    };

    const updatePosition = useCallback(
        (anchorElement: HTMLElement, popover: HTMLElement) => {
            computePosition(anchorElement, popover, {
                placement: placement,
                strategy: position,
                middleware: [
                    flip({
                        mainAxis: true,
                        crossAxis: true
                    }),
                    offsetPosition(offset)
                ]
            }).then((computePositionReturn: ComputePositionReturn) => {
                Object.assign(popover.style, {
                    width: `${anchorElement.offsetWidth}px`,
                    opacity: 1,
                    left: `${computePositionReturn.x}px`,
                    top: `${computePositionReturn.y}px`,
                    position: `${computePositionReturn.strategy}`,
                    transform: `none`,
                    transformOrigin: `0px 0px`
                });
            });
        },
        [anchorElement]
    );

    useEffect(() => {
        if (!open) {
            return;
        }
        const popover = virtualElement.current;
        if (!popover || !anchorElement) {
            return () => {
                if (rootElement) {
                    rootElement.removeAttribute('inert');
                }
                window.removeEventListener('keyup', keyHandler);
            };
        }
        const cleanup = autoUpdate(
            anchorElement,
            popover,
            () => updatePosition(anchorElement, popover),
            updatePositionOptions
        );
        return () => {
            cleanup();
        };
    }, [keyHandler, open, rootElement, anchorElement, placement, position]);

    useEffect(() => {
        if (open) {
            window.setTimeout(() => {
                if (rootElement) {
                    rootElement.setAttribute('inert', 'true');
                }
            }, 10);
        }
        return () => {
            if (rootElement) {
                rootElement.removeAttribute('inert');
            }
        };
    }, [open, rootElement]);

    useEffect(() => {
        const { current } = backdrop;
        if (current && allowBackdrop) {
            window.addEventListener('keyup', keyHandler);
        }
        return () => {
            window.removeEventListener('keyup', keyHandler);
        };
    }, [allowBackdrop, keyHandler]);

    const rootClassNames = useGenerateClassNames('overlay', ['root']);
    const backdropClassNames = useGenerateClassNames('overlay', ['backdrop']);
    const containerClassNames = useGenerateClassNames('overlay', ['container']);

    return (
        <Portal open={open} container={parent}>
            <ROOT
                open={open}
                anchorElement={anchorElement}
                parent={parent}
                className={clsx(rootClassNames, className)}
                {...overlayProps}
            >
                <Backdrop
                    ref={backdrop}
                    className={clsx(backdropClassNames, backdropClass)}
                    onClick={onBackdrop}
                    disabled={!allowBackdrop}
                    {...backdropProps}
                >
                    <CONTAINER
                        ref={virtualElement}
                        className={clsx(containerClassNames, containerClass)}
                        {...containerProps}
                    >
                        {React.cloneElement(children as ReactElement, {})}
                    </CONTAINER>
                </Backdrop>
            </ROOT>
        </Portal>
    );
});

export default Overlay;
