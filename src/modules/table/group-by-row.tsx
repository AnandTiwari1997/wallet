import { Checkbox } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { right } from '../../icons/icons';
import { TableColumn } from './table';
import { useEffect, useState } from 'react';

const GroupByRow = ({
    groupingKey,
    columns,
    row,
    selectable,
    selected,
    onRowSelectionChange
}: {
    groupingKey?: any;
    columns: TableColumn[];
    row: any;
    selectable?: boolean;
    selected?: boolean;
    onRowSelectionChange: (item: any) => void | any;
}) => {
    const [isSelected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        if (selected !== undefined) setSelected(selected);
    }, [selected]);

    const _columnAlignment = (column: string) => {
        return typeof row[column] === 'number' || row[column] instanceof Date ? 'end' : 'start';
    };

    const _columnWidth = () => {
        return (95 - (selectable ? 5 : 0)) / (columns.length + (groupingKey ? 1 : 0));
    };

    return (
        <tr className="tr-body" key={Math.random()}>
            {selectable && (
                <td className="td-body" style={{ width: '5%' }}>
                    <Checkbox
                        style={{ padding: 0 }}
                        checked={isSelected}
                        onChange={() => {
                            setSelected(!isSelected);
                            onRowSelectionChange(isSelected ? undefined : row);
                        }}
                    />
                </td>
            )}
            {groupingKey && <td className="td-body" style={{ width: `${_columnWidth()}%` }}></td>}
            {groupingKey && (
                <td className="td-body td-icon" style={{ width: '5%' }}>
                    <span className="td-span">
                        <button className="td-icon-button">
                            <i className="icon table-body-column-icon">
                                <FontAwesomeIcon icon={right} />
                            </i>
                        </button>
                    </span>
                </td>
            )}
            {columns.map((column) => {
                return (
                    <td className={`td-body td-content-align-${_columnAlignment(column.key)}`} style={{ width: `${_columnWidth()}%` }}>
                        {column.customRender ? column.customRender(row) : row[column.key]}
                    </td>
                );
            })}
        </tr>
    );
};

export default GroupByRow;
