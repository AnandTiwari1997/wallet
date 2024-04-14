import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import { SortableColumn, TableColumn } from './table';
import { sortDown, sortUp } from '../../icons/icons';

export interface SortedColumn {
    column: TableColumn;
    ascending: boolean;
}

const SortColumn = ({
    column,
    children,
    sortOption,
    onSort
}: {
    column: TableColumn;
    children: any;
    sortOption: SortableColumn;
    onSort: (sortedColumn: SortedColumn | undefined) => void;
}) => {
    const [hovered, setHovered] = useState<boolean>(false);
    const [showHover, setShowHover] = useState<boolean>(true);

    const _startSortHover = (column: TableColumn) => {
        setHovered(showHover && (column?.sortable ? column.sortable : false));
    };

    const _endSortHover = (column: TableColumn) => {
        setShowHover(true);
        setHovered(false);
    };

    const _sort = (column: TableColumn) => {
        setShowHover(false);
        setHovered(false);
        if (!column?.sortable && !hovered) {
            return;
        }
        if (sortOption.active && !sortOption.ascending) {
            sortOption.active = false;
            onSort(undefined);
            return;
        }
        if (sortOption.active) {
            sortOption.ascending = false;
        }
        const sort = {
            column: column,
            ascending: sortOption.ascending
        };
        onSort(sort);
    };

    const renderSortOptionBefore = (column: TableColumn) => {
        if (column.sortable && !sortOption.placeAfter) {
            return (
                <i style={{ paddingRight: '5px' }} className="sort-icon">
                    <FontAwesomeIcon icon={sortOption.active ? (sortOption.ascending ? sortUp : sortDown) : sortUp} />
                </i>
            );
        }
        return <></>;
    };

    const renderSortOptionAfter = (column: TableColumn) => {
        if (column.sortable && sortOption.placeAfter) {
            return (
                <i style={{ paddingLeft: '5px' }} className="sort-icon">
                    <FontAwesomeIcon icon={sortOption.active ? (sortOption.ascending ? sortUp : sortDown) : sortUp} />
                </i>
            );
        }
        return <></>;
    };

    return (
        <span
            className={`${column.sortable ? 'td-span-sortable' : ''} ${hovered ? 'td-span-sortable-hover' : ''} ${
                sortOption.active ? 'td-span-sort-active' : ''
            }`}
            onMouseEnter={() => _startSortHover(column)}
            onMouseLeave={() => _endSortHover(column)}
            onClick={() => _sort(column)}
        >
            {renderSortOptionBefore(column)}
            {children}
            {renderSortOptionAfter(column)}
        </span>
    );
};
export default SortColumn;
