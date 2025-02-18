import { Property } from 'csstype';

interface BorderProps<TLength = string | number> {
    border?: Property.Border<TLength> | undefined;
    borderTop?: Property.BorderTop<TLength> | undefined;
    borderBottom?: Property.BorderBottom<TLength> | undefined;
    borderLeft?: Property.BorderLeft<TLength> | undefined;
    borderRight?: Property.BorderRight<TLength> | undefined;

    borderRadius?: Property.BorderRadius<TLength> | undefined;
    borderTopLeftRadius?: Property.BorderTopLeftRadius<TLength> | undefined;
    borderTopRightRadius?: Property.BorderTopRightRadius<TLength> | undefined;
    borderBottomLeftRadius?: Property.BorderBottomLeftRadius<TLength> | undefined;
    borderBottomRightRadius?: Property.BorderBottomRightRadius<TLength> | undefined;

    borderWidth?: Property.BorderWidth<TLength> | undefined;
    borderTopWidth?: Property.BorderTopWidth<TLength> | undefined;
    borderBottomWidth?: Property.BorderBottomWidth<TLength> | undefined;
    borderLeftWidth?: Property.BorderLeftWidth<TLength> | undefined;
    borderRightWidth?: Property.BorderRightWidth<TLength> | undefined;

    borderStyle?: Property.BorderStyle | undefined;
    borderTopStyle?: Property.BorderTopStyle | undefined;
    borderBottomStyle?: Property.BorderBottomStyle | undefined;
    borderLeftStyle?: Property.BorderLeftStyle | undefined;
    borderRightStyle?: Property.BorderRightStyle | undefined;

    borderColor?: Property.BorderColor | undefined;
    borderTopColor?: Property.BorderTopColor | undefined;
    borderBottomColor?: Property.BorderBottomColor | undefined;
    borderLeftColor?: Property.BorderLeftColor | undefined;
    borderRightColor?: Property.BorderRightColor | undefined;
}

export default BorderProps;
