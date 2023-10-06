import { collapseStyle, expandStyle, GroupedTableData, RowExpandContext, TableColumn } from './table';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { expand } from '../../icons/icons';
import { Checkbox } from '@mui/material';
import GroupByRow from './group-by-row';

const GroupByRows = ({
    columns,
    row,
    selectable,
    selected,
    // expanded,
    onRowSelectionChange,
    onRowExpansionChange
}: {
    columns: TableColumn[];
    row: GroupedTableData<any>;
    selectable?: boolean;
    selected?: boolean;
    // expanded?: boolean;
    onRowSelectionChange: (item: GroupedTableData<any> | undefined, count: number) => void | any;
    onRowExpansionChange: (state: boolean) => void | any;
}) => {
    const [isExpanded, setExpanded] = useState<boolean>(false);
    const [isSelected, setSelected] = useState<boolean>(false);
    const [isAllSelected, setAllSelect] = useState<boolean | undefined>(undefined);
    const [selectedCount, setSelectedCount] = useState<number>(0);

    useEffect(() => {
        if (selected !== undefined) {
            setSelected(selected);
            setAllSelect(selected);
            setSelectedCount(selected ? row.data.length : 0);
        }
    }, [selected]);

    const _columnAlignment = (column: string) => {
        return typeof row.data[0][column] === 'number' || row.data[0][column] instanceof Date ? 'end' : 'start';
    };

    const _columnWidth = () => {
        return (95 - (selectable ? 5 : 0)) / (columns.length + 1);
    };

    return (
        <RowExpandContext.Consumer
            children={(expanded) => {
                return (
                    <>
                        <tr className="tr-body">
                            {selectable && (
                                <td className="td-body" style={{ width: '5%' }}>
                                    <Checkbox
                                        style={{ padding: 0 }}
                                        checked={isSelected}
                                        onChange={() => {
                                            setSelected(!isSelected);
                                            setAllSelect(!isSelected);
                                            setSelectedCount(isSelected ? 0 : row.data.length);
                                            onRowSelectionChange(isSelected ? undefined : row, row.data.length === selectedCount ? row.data.length : row.data.length);
                                        }}
                                        indeterminate={selectedCount > 0 && !isSelected}
                                    />
                                </td>
                            )}
                            <td className="td-body" style={{ width: `${_columnWidth()}%` }}>
                                {row.key}
                            </td>
                            <td className="td-body td-icon" style={{ width: '5%' }}>
                                <span className="td-span">
                                    <button
                                        className="td-icon-button"
                                        onClick={() => {
                                            setExpanded(!isExpanded);
                                            onRowExpansionChange(!isExpanded);
                                        }}
                                    >
                                        <i className="icon table-body-column-icon" style={(expanded === undefined ? isExpanded : expanded) ? collapseStyle : expandStyle}>
                                            <FontAwesomeIcon icon={expand} />
                                        </i>
                                    </button>
                                </span>
                            </td>
                            {columns.map((column) => (
                                <td className={`td-body td-content-align-${_columnAlignment(column.key)}`} style={{ width: `${_columnWidth()}%` }}>
                                    {column.groupByRender && column.groupByRender(row.data)}
                                </td>
                            ))}
                        </tr>
                        {(expanded === undefined ? isExpanded : expanded) &&
                            row.data.map((innerRow) => {
                                return (
                                    <GroupByRow
                                        groupingKey={row.key}
                                        columns={columns}
                                        row={innerRow}
                                        selectable={selectable}
                                        selected={isAllSelected}
                                        onRowSelectionChange={(item: any) => {
                                            const newCount = item ? selectedCount + 1 : selectedCount - 1;
                                            setSelectedCount(newCount);
                                            setSelected(newCount === row.data.length);
                                            setAllSelect(undefined);
                                            onRowSelectionChange(item, 1);
                                        }}
                                    />
                                );
                            })}
                    </>
                );
            }}
        ></RowExpandContext.Consumer>
    );
};

export default GroupByRows;
