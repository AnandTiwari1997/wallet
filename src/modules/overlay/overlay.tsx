import './overlay.css';
import { autoUpdate, computePosition, ComputePositionReturn, flip } from '@floating-ui/dom';
import React, { Fragment, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

type OverlayProps = {
    open: boolean;
    parent: HTMLElement;
    children: any;
    onBackdrop: () => any;
    backdropClass?: string;
    containerClass?: string;
    trigger: HTMLElement | null;
} & React.ComponentPropsWithoutRef<'div'>;

const Overlay = ({
    open,
    parent,
    children,
    onBackdrop,
    backdropClass,
    containerClass,
    trigger,
    ...props
}: OverlayProps) => {
    const backdrop = useRef<HTMLDivElement>(null);
    const virtualElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        // key handler and inert
        const { current } = backdrop;
        const keyHandler = (e: any) => [27].indexOf(e.which) >= 0 && onBackdrop();
        if (current) {
            window.addEventListener('keyup', keyHandler);
        }
        const rootElement = document.querySelector('#root');
        if (open) {
            window.setTimeout(() => {
                if (rootElement) {
                    rootElement.setAttribute('inert', 'true');
                }
            }, 10);
        }
        const popover = virtualElement.current;
        const invoker = trigger as HTMLElement;
        if (!popover || !invoker) {
            return () => {
                if (rootElement) {
                    rootElement.removeAttribute('inert');
                }
                window.removeEventListener('keyup', keyHandler);
            };
        }
        const cleanup = autoUpdate(invoker, popover, () => {
            computePosition(invoker, popover, {
                placement: 'bottom-start',
                strategy: 'absolute',
                middleware: [flip()]
            }).then((computePositionReturn: ComputePositionReturn) => {
                Object.assign(popover.style, {
                    left: `${computePositionReturn.x}px`,
                    top: `${computePositionReturn.y}px`,
                    position: `${computePositionReturn.strategy}`
                });
            });
        });

        return () => {
            if (rootElement) {
                rootElement.removeAttribute('inert');
            }
            window.removeEventListener('keyup', keyHandler);
            cleanup();
        };
    }, [open, trigger]);

    return (
        <Fragment>
            {open &&
                ReactDOM.createPortal(
                    <div className={'overlay'} {...props}>
                        <div
                            ref={backdrop}
                            className={['overlay-backdrop', backdropClass].join(' ')}
                            onClick={onBackdrop}
                        ></div>
                        <div
                            ref={virtualElement}
                            id={'overlay-container'}
                            className={containerClass ? containerClass : ''}
                        >
                            {children}
                        </div>
                    </div>,
                    parent ? parent : document.body
                )}
        </Fragment>
    );
};

export default Overlay;
