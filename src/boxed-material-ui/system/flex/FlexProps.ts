import { Property } from 'csstype';

interface FlexProps {
    alignItems?: Property.AlignItems;
    alignContent?: Property.AlignContent;
    justifyItems?: Property.JustifyItems;
    justifyContent?: Property.JustifyContent;
    flexWrap?: Property.FlexWrap;
    flexBasis?: Property.FlexBasis;
    flexDirection?: Property.FlexDirection;
    flex?: Property.Flex;
    justifySelf?: Property.JustifySelf;
    alignSelf?: Property.AlignSelf;
    order?: Property.Order;
    flexGrow?: Property.FlexGrow;
    flexShrink?: Property.FlexShrink;
}

export default FlexProps;
