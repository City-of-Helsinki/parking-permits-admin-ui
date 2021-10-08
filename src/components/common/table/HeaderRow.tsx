import React from 'react';
import { Column, OrderDirection } from '../../types';
import ColumnHeader from './ColumnHeader';
import styles from './HeaderRow.module.scss';

export interface HeaderRowProps<T> {
  columns: Column<T>[];
  orderBy?: string;
  orderDirection?: OrderDirection;
  onOrderBy: (field: string, orderDirection: OrderDirection) => void;
}

const HeaderRow = <T,>({
  columns,
  orderBy,
  orderDirection,
  onOrderBy,
}: HeaderRowProps<T>): React.ReactElement => (
  <tr className={styles['header-row']}>
    {columns.map(({ name, field }) => (
      <ColumnHeader
        key={field}
        title={name}
        field={field}
        direction={orderBy === field ? orderDirection : null}
        onOrderBy={onOrderBy}
      />
    ))}
  </tr>
);

export default HeaderRow;
