import React from 'react';
import { OrderBy } from '../../../types';
import { Column } from '../../types';
import HeaderRow from './HeaderRow';
import NoDataRow from './NoDataRow';
import styles from './Table.module.scss';
import TableRow from './TableRow';

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  loading: boolean;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
}

const Table = <T,>({
  columns,
  data,
  loading,
  orderBy,
  rowIdSelector,
  onOrderBy,
  onRowClick,
}: TableProps<T>): React.ReactElement => {
  let tableBody;
  if (loading) {
    tableBody = <NoDataRow colSpan={columns.length} text="Loading..." />;
  } else if (!data) {
    tableBody = <NoDataRow colSpan={columns.length} text="No data" />;
  } else {
    tableBody = data.map(row => (
      <TableRow
        onClick={onRowClick}
        key={rowIdSelector(row)}
        columns={columns}
        row={row}
      />
    ));
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
