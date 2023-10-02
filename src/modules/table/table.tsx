import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { expand, expandAll, right } from '../../icons/icons';
import { ArrayUtil, Transaction } from '../../data/transaction-data';
import './table.css';
import CSS from 'csstype';
import { Checkbox } from '@mui/material';
import SortColumn, { SortedColumn } from './sort-column';

export interface TableColumn {
    key: string;
    label: string;
    filterable?: boolean;
    sortable?: boolean;
    groupByRender?: (row: any[]) => any;
    customRender?: (row: any) => any;
    groupByKey?: (row: any) => string;
}

interface GroupedTableData<T> {
    key: string;
    data: T[];
}

export interface SortableColumn {
    key: string;
    active: boolean;
    ascending: boolean;
    placeAfter: boolean;
}

const intermediateExpandStyle: CSS.Properties = {
    transform: 'rotate(-90deg)',
    transition: 'transform 150ms ease 0s'
};

const collapseAllStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

const collapseStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

const expandStyle: CSS.Properties = {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms ease 0s'
};

const Table = ({
    columns,
    rows,
    groupByColumn,
    selectable,
    onSort
}: {
    columns: TableColumn[];
    rows: any[];
    groupByColumn?: TableColumn | undefined;
    selectable?: boolean;
    onSort?: (sortedColumn: SortedColumn | undefined) => any | void;
}) => {
    const [tableData, setTableData] = useState<GroupedTableData<any>[]>([]);
    const [initialData, setInitialData] = useState<any[]>(rows);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<{
        [key: string]: Transaction;
    }>({});
    const [selectedCountPerGroup, setSelectedCountPerGroup] = useState<{
        [key: string]: number;
    }>({});
    const [sortColumn, setSortColumn] = useState<SortedColumn | undefined>(undefined);
    const [columnAlignment, setColumnAlignment] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setInitialData(rows);
        columns.forEach((column) => {
            columnAlignment[column.key] =
                typeof tableData[0]?.data[0][column.key] === 'number' ||
                tableData[0]?.data[0][column.key] instanceof Date
                    ? 'end'
                    : 'start';
            setColumnAlignment({ ...columnAlignment });
        });
        if (groupByColumn) {
            if (!groupByColumn.groupByKey) return;
            const groupedTransaction: { [key: string]: any[] } = ArrayUtil.groupBy(rows, groupByColumn.groupByKey);
            const newData: GroupedTableData<any>[] = Object.keys(groupedTransaction).map((transactionKey) => {
                return {
                    key: transactionKey,
                    data: groupedTransaction[transactionKey]
                };
            });
            setTableData(newData);
        }
    }, [rows]);

    const getTableColumns = (): TableColumn[] => {
        if (!groupByColumn) return columns;
        return columns.filter((value) => value.key !== groupByColumn.key);
    };

    const _columnWidth = () => {
        return (100 - (selectable ? 5 : 0) - (groupByColumn ? 5 : 0)) / columns.length;
    };

    const _handleRowSelection = (row: any) => {
        const key: string = selectionKey(row);
        if (groupByColumn && groupByColumn.groupByKey) {
            const keyForGroupBy = groupByColumn.groupByKey(row);
            if (selectedRows[key]) {
                selectedCountPerGroup[keyForGroupBy] -= 1;
            } else {
                selectedCountPerGroup[keyForGroupBy] = (selectedCountPerGroup[keyForGroupBy] || 0) + 1;
            }
            setSelectedCountPerGroup({
                ...selectedCountPerGroup
            });
        }
        if (selectedRows[key]) {
            delete selectedRows[key];
        } else {
            selectedRows[key] = row;
        }
        setSelectedRows({ ...selectedRows });
    };

    const _handleGlobalSelection = () => {
        if (Object.keys(selectedRows).length === initialData.length) {
            setSelectedRows({});
            setSelectedCountPerGroup({});
        } else {
            tableData.forEach((value) => {
                selectedCountPerGroup[value.key] = value.data.length;
                value.data.forEach((value1) => (selectedRows[selectionKey(value1)] = value1));
            });
            setSelectedRows({ ...selectedRows });
            setSelectedCountPerGroup({ ...selectedCountPerGroup });
        }
    };

    const _handleGroupSelection = (groupedTableData: GroupedTableData<any>) => {
        const isAllSelected = selectedCountPerGroup[groupedTableData.key] === groupedTableData.data.length;
        groupedTableData.data.forEach((value) => {
            const key: string = selectionKey(value);
            if (isAllSelected) {
                delete selectedRows[key];
                selectedCountPerGroup[groupedTableData.key] -= 1;
            } else {
                if (!selectedRows[key]) {
                    selectedCountPerGroup[groupedTableData.key] =
                        (selectedCountPerGroup[groupedTableData.key] || 0) + 1;
                }
                selectedRows[key] = value;
            }
        });
        setSelectedCountPerGroup({
            ...selectedCountPerGroup
        });
        setSelectedRows({ ...selectedRows });
    };

    const selectionKey = (row: any): string => {
        return Object.keys(row)
            .map((key) => row[key])
            .join('');
    };

    const isExpanded = (key: string): boolean => {
        return expandedRows.includes(key);
    };

    const getSortOption = (column: TableColumn): SortableColumn => {
        return {
            key: column.key,
            active: sortColumn?.column.key === column.key,
            ascending: sortColumn?.column.key === column.key ? sortColumn.ascending : true,
            placeAfter: columnAlignment[column.key] === 'start'
        };
    };

    const _sort = (sortedColumn: SortedColumn | undefined) => {
        setSortColumn(sortedColumn);
        if (onSort) onSort(sortedColumn);
    };

    const renderRows = (dataRows: any[]) => {
        return dataRows.map((row) => {
            return (
                <tr className="tr-body" key={Math.random()}>
                    {selectable && (
                        <td className="td-body" style={{ width: '5%' }}>
                            <Checkbox
                                style={{ padding: 0 }}
                                checked={!!selectedRows[selectionKey(row)]}
                                onChange={() => _handleRowSelection(row)}
                            />
                        </td>
                    )}
                    {groupByColumn && <td className="td-body" style={{ width: `${_columnWidth()}%` }}></td>}
                    {groupByColumn && (
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
                    {getTableColumns().map((column) => {
                        return (
                            <td
                                className={`td-body td-content-align-${columnAlignment[column.key]}`}
                                style={{ width: `${_columnWidth()}%` }}
                            >
                                {column.customRender ? column.customRender(row) : row[column.key]}
                            </td>
                        );
                    })}
                </tr>
            );
        });
    };

    return (
        <table className="table">
            <thead className="thead">
                <tr className="tr-header" key={Math.random()}>
                    {selectable && (
                        <td className="td-header" style={{ width: '5%' }}>
                            <Checkbox
                                style={{ padding: 0 }}
                                onChange={_handleGlobalSelection}
                                checked={Object.keys(selectedRows).length === initialData.length}
                                indeterminate={
                                    Object.keys(selectedRows).length > 0 &&
                                    Object.keys(selectedRows).length !== initialData.length
                                }
                            />
                        </td>
                    )}
                    {groupByColumn && (
                        <td className="td-header" style={{ width: `${_columnWidth()}%` }}>
                            {groupByColumn.sortable && (
                                <SortColumn
                                    column={groupByColumn}
                                    sortOption={getSortOption(groupByColumn)}
                                    onSort={_sort}
                                >
                                    <span className="td-span">{groupByColumn.label}</span>
                                </SortColumn>
                            )}
                            {!groupByColumn.sortable && <span className="td-span">{groupByColumn.label}</span>}
                        </td>
                    )}
                    {groupByColumn && (
                        <td className="td-header td-icon" style={{ width: '5%' }}>
                            <span className="td-span">
                                <button
                                    className="td-icon-button"
                                    onClick={() => {
                                        if (expandedRows.length === tableData?.length) {
                                            setExpandedRows([]);
                                        } else {
                                            setExpandedRows(tableData.map((item) => item.key));
                                        }
                                    }}
                                >
                                    <i
                                        className="icon table-body-column-icon"
                                        style={
                                            expandedRows.length > 0
                                                ? expandedRows.length === tableData.length
                                                    ? collapseAllStyle
                                                    : intermediateExpandStyle
                                                : {}
                                        }
                                    >
                                        <FontAwesomeIcon icon={expandAll} />
                                    </i>
                                </button>
                            </span>
                        </td>
                    )}
                    {getTableColumns().map((column, index: number) => {
                        return (
                            <td
                                className={`td-header td-content-align-${columnAlignment[column.key]}`}
                                style={{ width: `${_columnWidth()}%` }}
                            >
                                {column.sortable && (
                                    <SortColumn column={column} sortOption={getSortOption(column)} onSort={_sort}>
                                        <span className="td-span">{column.label}</span>
                                    </SortColumn>
                                )}
                                {!column.sortable && (
                                    <span className={`${index === getTableColumns().length - 1 ? '' : 'td-span'}`}>
                                        {column.label}
                                    </span>
                                )}
                            </td>
                        );
                    })}
                </tr>
            </thead>
            <tbody className="tbody">
                {groupByColumn &&
                    tableData.map((groupedTableData: GroupedTableData<any>) => {
                        return (
                            <>
                                <tr className="tr-body" key={Math.random()}>
                                    {selectable && (
                                        <td className="td-body" style={{ width: '5%' }}>
                                            <Checkbox
                                                style={{ padding: 0 }}
                                                checked={
                                                    selectedCountPerGroup[groupedTableData.key] ===
                                                    groupedTableData.data.length
                                                }
                                                onChange={() => _handleGroupSelection(groupedTableData)}
                                                indeterminate={
                                                    selectedCountPerGroup[groupedTableData.key] > 0 &&
                                                    selectedCountPerGroup[groupedTableData.key] !==
                                                        groupedTableData.data.length
                                                }
                                            />
                                        </td>
                                    )}
                                    <td className="td-body" style={{ width: `${_columnWidth()}%` }}>
                                        {groupedTableData.key}
                                    </td>
                                    <td className="td-body td-icon" style={{ width: '5%' }}>
                                        <span className="td-span">
                                            <button
                                                className="td-icon-button"
                                                onClick={() => {
                                                    if (isExpanded(groupedTableData.key)) {
                                                        const index = expandedRows.indexOf(groupedTableData.key);
                                                        setExpandedRows([
                                                            ...expandedRows.slice(0, index),
                                                            ...expandedRows.slice(index + 1)
                                                        ]);
                                                    } else {
                                                        setExpandedRows([...expandedRows, groupedTableData.key]);
                                                    }
                                                }}
                                            >
                                                <i
                                                    className="icon table-body-column-icon"
                                                    style={
                                                        isExpanded(groupedTableData.key) ? collapseStyle : expandStyle
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={expand} />
                                                </i>
                                            </button>
                                        </span>
                                    </td>
                                    {getTableColumns().map((column) => (
                                        <td
                                            className={`td-body td-content-align-${columnAlignment[column.key]}`}
                                            style={{ width: `${_columnWidth()}%` }}
                                        >
                                            {column.groupByRender && column.groupByRender(groupedTableData.data)}
                                        </td>
                                    ))}
                                </tr>
                                {isExpanded(groupedTableData.key) && renderRows(groupedTableData.data)}
                            </>
                        );
                    })}
                {!groupByColumn && renderRows(initialData)}
            </tbody>
        </table>
    );
};
export default Table;
