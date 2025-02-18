import { Property } from 'csstype';

interface LayoutProps<TLength = string | number> {
    width?: Property.Width<TLength>;
    height?: Property.Height<TLength>;
    minWidth?: Property.MinWidth<TLength>;
    minHeight?: Property.MinHeight<TLength>;
    maxWidth?: Property.MaxWidth<TLength>;
    maxHeight?: Property.MaxHeight<TLength>;
    display?: Property.Display;
    verticalAlign?: Property.VerticalAlign;
    size?: Property.Height<TLength>;
    opacity?: Property.Opacity;
    overflow?: Property.Overflow;
    overflowX?: Property.OverflowX;
    overflowY?: Property.OverflowY;
}

export default LayoutProps;
