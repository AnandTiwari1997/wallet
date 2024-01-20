import { createContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrowLeft, arrowRight, expandAll, hide, show } from '../../icons/icons';
import { ArrayUtil } from '../../data/transaction-data';
import './table.css';
import CSS from 'csstype';
import { Checkbox } from '@mui/material';
import SortColumn, { SortedColumn } from './sort-column';
import GroupByRows from './group-by-rows';
import GroupByRow from './group-by-row';
import { useGlobalLoadingState } from '../../index';
import IconButton from '../icon/icon-button';
import Select from '../select/select';

export interface TableColumn {
    key: string;
    label: string;
    filterable?: boolean;
    sortable?: boolean;
    groupByRender?: (row: any[]) => any;
    customRender?: (row: any) => any;
    groupByKey?: (row: any) => string;
    columnFooter?: (rows: TableData<any>[]) => any;
    hidden?: boolean;
}

export interface TableData<T> {
    data: T[];
    selected?: boolean;
}

export interface GroupedTableData<T> extends TableData<T> {
    key: string[];
    expanded: boolean;
}

export interface SortableColumn {
    key: string;
    active: boolean;
    ascending: boolean;
    placeAfter: boolean;
}

export interface TablePagination {
    pageSize: number;
    pageNumber: number;
}

export const intermediateExpandStyle: CSS.Properties = {
    transform: 'rotate(-90deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseAllStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const expandStyle: CSS.Properties = {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms ease 0s'
};

export const RowExpandContext = createContext<boolean | undefined>(undefined);

const Table = ({
    columns,
    rows,
    groupByColumn,
    selectable,
    onSort,
    onPagination,
    count
}: {
    columns: TableColumn[];
    rows: any[];
    groupByColumn?: TableColumn[] | [] | undefined;
    selectable?: boolean;
    onSort?: (sortedColumn: SortedColumn | undefined) => any | void;
    onPagination?: (tablePagination: TablePagination) => any | void;
    count: number;
}) => {
    const [tableData, setTableData] = useState<TableData<any>[]>([]);
    const [initialData, setInitialData] = useState<any[]>(rows);
    const [sortColumn, setSortColumn] = useState<SortedColumn | undefined>(undefined);
    const [isExpanded, setExpanded] = useState<boolean>(false);
    const [isSelected, setSelected] = useState<boolean>(false);
    const [isAllExpanded, setAllExpanded] = useState<boolean | undefined>(undefined);
    const [isAllSelected, setAllSelect] = useState<boolean | undefined>(undefined);
    const [selectedCount, setSelectedCount] = useState<number>(0);
    const [expandedCount, setExpandedCount] = useState<number>(0);
    const [columnFooterEnabled, setColumnFooterEnabled] = useState<boolean>(false);

    // Table Pagination State
    const [currentPageSize, setCurrentPageSize] = useState<number>(25);
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
    const [hidden, setHidden] = useState<{ [key: string]: boolean | undefined }>({});

    // Table Loading state
    const [state, dispatch] = useGlobalLoadingState();

    useEffect(() => {
        setCurrentPageNumber(0);
    }, [count]);

    useEffect(() => {
        setInitialData(rows);
        let col = columns.find((column) => column.columnFooter !== undefined);
        setColumnFooterEnabled(col !== undefined);
        if (groupByColumn && groupByColumn.length > 0) {
            const groupedTransaction: { [key: string]: any[] } = ArrayUtil.groupBy(rows, (item) => {
                let key: string[] = [];
                for (let col of groupByColumn) {
                    if (col.groupByKey) key.push(col.groupByKey(item) || '');
                }
                return key.join('%%%');
            });
            const newData: GroupedTableData<any>[] = Object.keys(groupedTransaction).map((transactionKey) => {
                return {
                    key: transactionKey.split('%%%'),
                    data: groupedTransaction[transactionKey],
                    expanded: false
                };
            });
            setTableData(newData);
        } else {
            const newData: TableData<any>[] = ArrayUtil.map<any, TableData<any>>(rows, (item: any) => {
                return { data: [item] };
            });
            setTableData(newData);
        }
        dispatch(false);
        columns.forEach((value) => {
            hidden[value.key] = value.hidden;
        });
        setHidden({ ...hidden });
    }, [rows, columns]);

    const _columns = (): TableColumn[] => {
        if (!groupByColumn || groupByColumn.length == 0) return columns;
        return columns.filter((col) => groupByColumn.find((tableCol) => col.key === tableCol.key) === undefined);
    };

    const _columnAlignment = (column: string) => {
        if (initialData.length == 0) return 'end';
        return typeof initialData[0][column] === 'number' || initialData[0][column] instanceof Date ? 'end' : 'start';
    };

    const _columnWidth = () => {
        return (100 - (selectable ? 5 : 0) - (groupByColumn ? 5 : 0)) / columns.length;
    };

    const getSortOption = (column: TableColumn): SortableColumn => {
        return {
            key: column.key,
            active: sortColumn?.column.key === column.key,
            ascending: sortColumn?.column.key === column.key ? sortColumn.ascending : true,
            placeAfter: _columnAlignment(column.key) === 'start'
        };
    };

    const _sort = (sortedColumn: SortedColumn | undefined) => {
        setSortColumn(sortedColumn);
        if (onSort) onSort(sortedColumn);
    };

    const _paginationPageDetails = () => {
        let currentPageLimit = (currentPageNumber + 1) * currentPageSize;
        let pageStart = currentPageLimit - currentPageSize + 1;
        let pageEnd = count < currentPageLimit ? count : currentPageLimit;
        return `${pageStart} - ${pageEnd} / ${count}`;
    };

    const _paginationDisabled = () => {
        let currentPageLimit = (currentPageNumber + 1) * currentPageSize;
        let pageStart = currentPageLimit - currentPageSize + 1;
        let pageEnd = count < currentPageLimit ? count : currentPageLimit;
        return currentPageSize > pageEnd - pageStart - 1;
    };

    return (
        <table className="table">
            <thead className="thead">
                <tr className="tr-header" key={Math.random()}>
                    {selectable && (
                        <td className="td-header" style={{ width: '5%' }}>
                            <Checkbox
                                style={{ padding: 0 }}
                                onChange={() => {
                                    setSelected(!isSelected);
                                    setAllSelect(!isSelected);
                                    setSelectedCount(isSelected ? 0 : initialData.length);
                                }}
                                checked={isSelected}
                                indeterminate={selectedCount > 0 && !isSelected}
                            />
                        </td>
                    )}
                    {groupByColumn &&
                        groupByColumn.map((groupColumn) => {
                            return (
                                <td className={`td-header`} style={{ width: `${_columnWidth()}%` }}>
                                    {groupColumn.sortable && (
                                        <SortColumn column={groupColumn} sortOption={getSortOption(groupColumn)} onSort={_sort}>
                                            <span className="td-span">{groupColumn.label}</span>
                                        </SortColumn>
                                    )}
                                    {!groupColumn.sortable && <span className="td-span">{groupColumn.label}</span>}
                                </td>
                            );
                        })}
                    {groupByColumn && groupByColumn.length > 0 && (
                        <td className="td-header td-icon" style={{ width: '5%' }}>
                            <span className="td-span">
                                <button
                                    className="td-icon-button"
                                    onClick={() => {
                                        setExpanded(!isExpanded);
                                        setAllExpanded(!isExpanded);
                                        setExpandedCount(isExpanded ? 0 : tableData.length);
                                    }}
                                >
                                    <i className="icon table-body-column-icon" style={expandedCount > 0 ? (isExpanded ? collapseAllStyle : intermediateExpandStyle) : {}}>
                                        <FontAwesomeIcon icon={expandAll} />
                                    </i>
                                </button>
                            </span>
                        </td>
                    )}
                    {_columns().map((column, index: number) => {
                        return (
                            <td className={`td-header td-content-align-${_columnAlignment(column.key)}`} style={{ width: `${_columnWidth()}%` }}>
                                {column.sortable && (
                                    <SortColumn column={column} sortOption={getSortOption(column)} onSort={_sort}>
                                        <span className="td-span">{column.label}</span>
                                    </SortColumn>
                                )}
                                {!column.sortable && <span className={`${index === _columns().length - 1 ? '' : 'td-span'}`}>{column.label}</span>}
                                {hidden[column.key] !== undefined ? (
                                    <IconButton
                                        style={{
                                            marginLeft: '10px'
                                        }}
                                        icon={hidden[column.key] ? show : hide}
                                        onClick={() => {
                                            hidden[column.key] = !hidden[column.key];
                                            column.hidden = hidden[column.key];
                                            setHidden({ ...hidden });
                                            setTableData([...tableData]);
                                        }}
                                    />
                                ) : (
                                    ''
                                )}
                            </td>
                        );
                    })}
                </tr>
                {state && (
                    <tr className="progress">
                        <td className="indeterminate"></td>
                    </tr>
                )}
            </thead>
            <tbody
                className="tbody"
                style={{
                    height: columnFooterEnabled ? 'calc(100% - 144px)' : 'calc(100% - 96px)'
                }}
            >
                {state && <></>}
                {!state &&
                    tableData.map((groupedTableData: TableData<any>) => {
                        return (
                            <>
                                {groupByColumn ? (
                                    <RowExpandContext.Provider value={isAllExpanded}>
                                        <GroupByRows
                                            columns={_columns()}
                                            row={groupedTableData as GroupedTableData<any>}
                                            selectable={selectable}
                                            selected={isAllSelected}
                                            onRowSelectionChange={(groupedTableData, count) => {
                                                const newCount = groupedTableData ? selectedCount + count : selectedCount - count;
                                                setSelectedCount(newCount);
                                                setSelected(newCount === initialData.length);
                                                setAllSelect(undefined);
                                            }}
                                            onRowExpansionChange={(state) => {
                                                const newCount = state ? expandedCount + 1 : expandedCount - 1;
                                                setExpandedCount(newCount);
                                                setExpanded(newCount === tableData.length);
                                                setAllExpanded(undefined);
                                            }}
                                        />
                                    </RowExpandContext.Provider>
                                ) : (
                                    <GroupByRow
                                        columns={_columns()}
                                        row={groupedTableData.data[0]}
                                        selectable={selectable}
                                        selected={isAllSelected}
                                        onRowSelectionChange={(item: any) => {
                                            const newCount = item ? selectedCount + 1 : selectedCount - 1;
                                            setSelectedCount(newCount);
                                            setSelected(newCount === initialData.length);
                                            setAllSelect(undefined);
                                        }}
                                    />
                                )}
                            </>
                        );
                    })}
            </tbody>
            <tfoot
                className="tfoot"
                style={{
                    height: columnFooterEnabled ? '96px' : '48px'
                }}
            >
                {columnFooterEnabled && (
                    <tr
                        className="tr-footer"
                        style={{
                            height: columnFooterEnabled ? 'calc(50% - 1px)' : 'calc(100% - 1px)',
                            borderBottom: '1px solid lightgray'
                        }}
                    >
                        {selectable && <td className="td-body" style={{ width: '5%' }}></td>}
                        {groupByColumn &&
                            groupByColumn.map((column) => (
                                <td
                                    className="td-body"
                                    style={{
                                        width: `${(100 - (selectable ? 5 : 0) - (groupByColumn && groupByColumn.length > 0 ? 5 : 0)) / columns.length}%`
                                    }}
                                >
                                    {column.columnFooter ? column.columnFooter(tableData) : ''}
                                </td>
                            ))}
                        {groupByColumn && groupByColumn.length > 0 && <td className="td-body" style={{ width: '5%' }}></td>}
                        {_columns().map((column) => (
                            <td
                                className="td-body"
                                style={{
                                    width: `${(100 - (selectable ? 5 : 0) - (groupByColumn && groupByColumn.length > 0 ? 5 : 0)) / columns.length}%`
                                }}
                            >
                                {column.columnFooter ? column.columnFooter(tableData) : ''}
                            </td>
                        ))}
                    </tr>
                )}
                <tr
                    className="tr-footer"
                    style={{
                        height: columnFooterEnabled ? '50%' : '100%'
                    }}
                >
                    <td className="td-footer">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="td-footer-page-size-container">
                                <div className="td-footer-page-size-title">Rows per Page</div>
                                <Select
                                    className="td-select"
                                    selectedOption={currentPageSize}
                                    onChange={(event) => {
                                        if (!onPagination) return;
                                        let newPageSize = Number.parseInt(event.target.value);
                                        setCurrentPageSize(newPageSize);
                                        setCurrentPageNumber(0);
                                        onPagination({
                                            pageSize: Number.parseInt(event.target.value),
                                            pageNumber: 0
                                        });
                                    }}
                                    options={[
                                        { value: 25, label: '25' },
                                        { value: 50, label: '50' },
                                        { value: 75, label: '75' },
                                        { value: 100, label: '100' }
                                    ]}
                                ></Select>
                            </div>
                            <div className="td-footer-page-update">
                                <IconButton
                                    icon={arrowLeft}
                                    onClick={() => {
                                        if (!onPagination) return;
                                        let newPageNumber = currentPageNumber - 1;
                                        if (newPageNumber < 0) return;
                                        setCurrentPageNumber(newPageNumber);
                                        onPagination({ pageSize: currentPageSize, pageNumber: newPageNumber });
                                    }}
                                />
                                <div className="td-footer-page-details">
                                    <div>{_paginationPageDetails()}</div>
                                </div>
                                <IconButton
                                    icon={arrowRight}
                                    onClick={() => {
                                        if (!onPagination) return;
                                        let newPageNumber = currentPageNumber + 1;
                                        if (newPageNumber > count / currentPageSize) return;
                                        setCurrentPageNumber(newPageNumber);
                                        onPagination({ pageSize: currentPageSize, pageNumber: newPageNumber });
                                    }}
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};
export default Table;
