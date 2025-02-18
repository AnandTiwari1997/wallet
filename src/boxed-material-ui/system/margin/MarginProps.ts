import { Property } from 'csstype';

interface MarginProps<TLength = string | number> {
    margin?: Property.Margin<TLength>;
    marginTop?: Property.MarginTop<TLength>;
    marginBottom?: Property.MarginBottom<TLength>;
    marginLeft?: Property.MarginLeft<TLength>;
    marginRight?: Property.MarginRight<TLength>;
}

export default MarginProps;
