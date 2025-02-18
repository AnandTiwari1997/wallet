import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import 'modules/grids/grid.css';

type GridProp = {
    xl?: number;
    xs?: number;
    md?: number;
    sm?: number;
    lg?: number;
} & PropsWithChildren &
    ComponentPropsWithoutRef<'div'>;

const Grid = ({ xs = 12, sm = 12, md = 12, lg = 12, xl = 12, children, ...props }: GridProp) => {
    return (
        <div
            {...props}
            className={`grid-item item col-xs-${xs} col-sm-${sm} col-md-${md} col-lg-${lg} col-xl-${xl} ${
                props.className ? props.className : ''
            }`}
        >
            {children}
        </div>
    );
};

export default Grid;
