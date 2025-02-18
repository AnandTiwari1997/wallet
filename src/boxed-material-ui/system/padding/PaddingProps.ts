import { Property } from 'csstype';

interface PaddingProps<TLength = string | number> {
    padding?: Property.Padding<TLength> | undefined;
    paddingTop?: Property.PaddingTop<TLength> | undefined;
    paddingBottom?: Property.PaddingBottom<TLength> | undefined;
    paddingLeft?: Property.PaddingLeft<TLength> | undefined;
    paddingRight?: Property.PaddingRight<TLength> | undefined;
}

export default PaddingProps;
