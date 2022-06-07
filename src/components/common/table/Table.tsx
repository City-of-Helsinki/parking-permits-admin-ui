import React from 'react';
import { OrderBy } from '../../../types';
import { Column } from '../../types';
import HeaderRow from './HeaderRow';
import NoDataRow from './NoDataRow';
import styles from './Table.module.scss';
import TableRow from './TableRow';

export interface TableProps<T> {
  selection?: T[] | null;
  columns: Column<T>[];
  data: T[] | undefined;
  loading: boolean;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (rows: T[]) => void;
}

const Table = <T,>({
  selection = null,
  columns,
  data,
  loading,
  orderBy,
  rowIdSelector,
  onOrderBy,
  onRowClick,
  onSelectionChange,
}: TableProps<T>): React.ReactElement => {
  let tableBody;
  if (loading) {
    tableBody = <NoDataRow colSpan={columns.length} text="Loading..." />;
  } else if (!data) {
    tableBody = <NoDataRow colSpan={columns.length} text="No data" />;
  } else {
    tableBody = data.map(row => {
      const rowId = rowIdSelector(row);
      return (
        <TableRow
          selected={
            selection
              ? selection.some(
                  selectedRow => rowIdSelector(selectedRow) === rowId
                )
              : null
          }
          onClick={onRowClick}
          key={rowId}
          rowId={rowId.toString()}
          columns={columns}
          row={row}
          onSelectionChange={checked => {
            if (!onSelectionChange) {
              return;
            }
            const currentSelection = selection || [];
            const newSelection = checked
              ? [...currentSelection, row]
              : currentSelection.filter(
                  selectedRow => rowIdSelector(selectedRow) !== rowId
                );
            onSelectionChange(newSelection);
          }}
        />
      );
    });
  }
  return (
    <table className={styles.table}>
      <thead>
        <HeaderRow columns={columns} orderBy={orderBy} onOrderBy={onOrderBy} />
      </thead>
      <tbody className={styles['table-body']}>{tableBody}</tbody>
    </table>
  );
};

export default Table;
