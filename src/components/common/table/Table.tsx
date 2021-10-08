import React from 'react';
import { Column, OrderDirection } from '../../types';
import HeaderRow from './HeaderRow';
import NoDataRow from './NoDataRow';
import styles from './Table.module.scss';
import TableRow from './TableRow';

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  loading: boolean;
  orderBy?: string;
  orderDirection?: OrderDirection;
  rowIdSelector: (row: T) => string | number;
  onOrderBy: (orderBy: string, orderDirection: OrderDirection) => void;
}

const Table = <T,>({
  columns,
  data,
  loading,
  orderBy,
  orderDirection,
  rowIdSelector,
  onOrderBy,
}: TableProps<T>): React.ReactElement => {
  let tableBody;
  if (loading) {
    tableBody = <NoDataRow colSpan={columns.length} text="Loading..." />;
  } else if (!data) {
    tableBody = <NoDataRow colSpan={columns.length} text="No data" />;
  } else {
    tableBody = data.map(row => (
      <TableRow key={rowIdSelector(row)} columns={columns} row={row} />
    ));
  }
  return (
    <table className={styles.table}>
      <thead>
        <HeaderRow
          columns={columns}
          orderBy={orderBy}
          orderDirection={orderDirection}
          onOrderBy={onOrderBy}
        />
      </thead>
      <tbody className={styles['table-body']}>{tableBody}</tbody>
    </table>
  );
};

export default Table;
