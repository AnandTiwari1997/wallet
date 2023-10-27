import { createContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrowLeft, arrowRight, expandAll } from '../../icons/icons';
import { ArrayUtil } from '../../data/transaction-data';
import './table.css';
import CSS from 'csstype';
import { Checkbox } from '@mui/material';
import SortColumn, { SortedColumn } from './sort-column';
import GroupByRows from './group-by-rows';
import GroupByRow from './group-by-row';
import { useGlobalLoadingState } from '../../index';

export interface TableColumn {
    key: string;
    label: string;
    filterable?: boolean;
    sortable?: boolean;
    groupByRender?: (row: any[]) => any;
    customRender?: (row: any) => any;
    groupByKey?: (row: any) => string;
}

export interface TableData<T> {
    data: T[];
    selected?: boolean;
}

export interface GroupedTableData<T> extends TableData<T> {
    key: string;
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
    groupByColumn?: TableColumn | undefined;
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

    // Table Pagination State
    const [currentPageSize, setCurrentPageSize] = useState<number>(25);
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

    // Table Loading state
    const [state, dispatch] = useGlobalLoadingState();

    useEffect(() => {
        setCurrentPageNumber(0);
    }, [count]);

    useEffect(() => {
        setInitialData(rows);
        if (groupByColumn) {
            if (!groupByColumn.groupByKey) return;
            const groupedTransaction: { [key: string]: any[] } = ArrayUtil.groupBy(rows, groupByColumn.groupByKey);
            const newData: GroupedTableData<any>[] = Object.keys(groupedTransaction).map((transactionKey) => {
                return {
                    key: transactionKey,
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
    }, [rows]);

    const _columns = (): TableColumn[] => {
        if (!groupByColumn) return columns;
        return columns.filter((value) => value.key !== groupByColumn.key);
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
                    {groupByColumn && (
                        <td className={`td-header`} style={{ width: `${_columnWidth()}%` }}>
                            {groupByColumn.sortable && (
                                <SortColumn column={groupByColumn} sortOption={getSortOption(groupByColumn)} onSort={_sort}>
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
            <tbody className="tbody">
                {state && <></>}
                {!state &&
                    tableData.map((groupedTableData: TableData<any>) => {
                        return (
                            <>
                                {' '}
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
            <tfoot className="tfoot">
                <tr className="tr-footer">
                    <td className="td-footer">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="td-footer-page-size-container">
                                <div className="td-footer-page-size-title">Rows per Page</div>
                                <select
                                    className="td-select"
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
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={75}>75</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="td-footer-page-update">
                                <button
                                    className="td-icon-button"
                                    disabled={currentPageNumber === 0}
                                    onClick={() => {
                                        if (!onPagination) return;
                                        let newPageNumber = currentPageNumber - 1;
                                        if (newPageNumber < 0) return;
                                        setCurrentPageNumber(newPageNumber);
                                        onPagination({ pageSize: currentPageSize, pageNumber: newPageNumber });
                                    }}
                                >
                                    <FontAwesomeIcon icon={arrowLeft} />
                                </button>
                                <div className="td-footer-page-details">
                                    <div>{_paginationPageDetails()}</div>
                                </div>
                                <button
                                    className="td-icon-button"
                                    disabled={currentPageNumber + 1 > count / currentPageSize}
                                    onClick={() => {
                                        if (!onPagination) return;
                                        let newPageNumber = currentPageNumber + 1;
                                        if (newPageNumber > count / currentPageSize) return;
                                        setCurrentPageNumber(newPageNumber);
                                        onPagination({ pageSize: currentPageSize, pageNumber: newPageNumber });
                                    }}
                                >
                                    <FontAwesomeIcon icon={arrowRight} />
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    );
};
export default Table;
