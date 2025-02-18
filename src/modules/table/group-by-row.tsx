import { useEffect, useState } from 'react';

import { TableColumn } from './table';
import { hide, right, show } from '../../icons/icons';
import Checkbox from '../checkbox/checkbox';
import { Icon } from '../icon';
import IconButton from '../icon-button/icon-button';

const GroupByRow = ({
    groupingKey,
    columns,
    row,
    selectable,
    selected,
    onRowSelectionChange
}: {
    groupingKey?: any[];
    columns: TableColumn[];
    row: any;
    selectable?: boolean;
    selected?: boolean;
    onRowSelectionChange: (item: any) => void | any;
}) => {
    const [isSelected, setSelected] = useState<boolean>(false);
    const [hidden, setHidden] = useState<{ [key: string]: boolean | undefined }>({});

    useEffect(() => {
        if (selected !== undefined) {
            setSelected(selected);
        }
        columns.forEach((value) => {
            hidden[value.key] = value.hidden;
        });
        setHidden({ ...hidden });
    }, [selected, columns]);

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
                        customStyles={'td-checkbox-style'}
                        checked={isSelected}
                        onChange={() => {
                            setSelected(!isSelected);
                            onRowSelectionChange(isSelected ? undefined : row);
                        }}
                    />
                </td>
            )}
            {groupingKey &&
                groupingKey.map((key) => {
                    return <td className="td-body" style={{ width: `${_columnWidth()}%` }}></td>;
                })}
            {groupingKey && groupingKey.length > 0 && (
                <td className="td-body td-icon" style={{ width: '5%' }}>
                    <span className="td-span">
                        <button className="td-icon-button">
                            <i className="icon table-body-column-icon">
                                <Icon
                                    icon={right}
                                    svgProps={{
                                        height: '12px',
                                        width: '12px'
                                    }}
                                />
                            </i>
                        </button>
                    </span>
                </td>
            )}
            {columns.map((column) => {
                return (
                    <td
                        className={`td-body td-content-align-${_columnAlignment(column.key)}`}
                        style={{ width: `${_columnWidth()}%` }}
                    >
                        {hidden[column.key]
                            ? '********'
                            : column.customRender
                            ? column.customRender(row)
                            : row[column.key]}
                        {hidden[column.key] !== undefined ? (
                            <IconButton
                                style={{
                                    marginLeft: '10px'
                                }}
                                icon={hidden[column.key] ? show : hide}
                                onClick={() => {
                                    hidden[column.key] = !hidden[column.key];
                                    setHidden({ ...hidden });
                                }}
                            />
                        ) : (
                            ''
                        )}
                    </td>
                );
            })}
        </tr>
    );
};

export default GroupByRow;
