import React from 'react';
import { Column } from '../../types';
import styles from './TableRow.module.scss';

export interface TableRowProps<T> {
  columns: Column<T>[];
  row: T;
}

const TableRow = <T,>({
  columns,
  row,
}: TableRowProps<T>): React.ReactElement => (
  <tr className={styles['table-row']}>
    {columns.map(({ field, selector }) => (
      <td key={field}>{selector(row)}</td>
    ))}
  </tr>
);

export default TableRow;
