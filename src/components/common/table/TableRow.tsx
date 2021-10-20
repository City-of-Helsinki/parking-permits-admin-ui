import React from 'react';
import { Column } from '../../types';
import styles from './TableRow.module.scss';

export interface TableRowProps<T> {
  columns: Column<T>[];
  row: T;
  onClick?: (row: T) => void;
}

const TableRow = <T,>({
  columns,
  row,
  onClick,
}: TableRowProps<T>): React.ReactElement => (
  <tr
    className={styles['table-row']}
    onClick={() => {
      if (onClick) {
        onClick(row);
      }
    }}>
    {columns.map(({ field, selector }) => (
      <td key={field}>{selector(row)}</td>
    ))}
  </tr>
);

export default TableRow;
