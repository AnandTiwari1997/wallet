import { ComponentPropsWithoutRef, PropsWithChildren, useEffect, useRef } from 'react';
import 'modules/grids/grid.css';

type GridsProp = {
    spacing?: number;
    columns?: Array<number> | number | object;
    rowSpacing?: Array<number | string> | number | object | string;
    columnSpacing?: Array<number | string> | number | object | string;
    direction?:
        | 'column-reverse'
        | 'column'
        | 'row-reverse'
        | 'row'
        | Array<'column-reverse' | 'column' | 'row-reverse' | 'row'>
        | object;
    wrap?: 'nowrap' | 'wrap-reverse' | 'wrap';
} & PropsWithChildren &
    ComponentPropsWithoutRef<'div'>;

const Grids = ({ children, spacing = 1, columns, columnSpacing, rowSpacing, direction, wrap, ...props }: GridsProp) => {
    const wrapperElem = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (wrapperElem) {
            wrapperElem.current?.style.setProperty('--marginSpacing', `${-1 * spacing * 5}px`);
            wrapperElem.current?.style.setProperty('--paddingSpacing', `${spacing * 5}px`);
        }
    }, []);

    return (
        <div {...props}>
            <div ref={wrapperElem} className={`grid-wrapper ${props.className ? props.className : ''}`}>
                {children}
            </div>
        </div>
    );
};
export default Grids;
