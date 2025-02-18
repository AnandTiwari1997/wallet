import { Property } from 'csstype';

interface GridProps<TLength = string | number> {
    gridProps?: Property.Grid;
    gridGap?: Property.GridGap<TLength>;
    gridColumnGap?: Property.GridColumnGap<TLength>;
    gridRowGap?: Property.GridRowGap<TLength>;
    gridColumn?: Property.GridColumn;
    gridRow?: Property.GridRow;
    gridAutoFlow?: Property.GridAutoFlow;
    gridAutoColumns?: Property.GridAutoColumns;
    gridAutoRows?: Property.GridAutoRows;
    gridTemplateColumns?: Property.GridTemplateColumns<TLength>;
    gridTemplateRows?: Property.GridTemplateRows<TLength>;
    gridTemplateAreas?: Property.GridTemplateAreas;
    gridArea?: Property.GridArea;
}

export default GridProps;
