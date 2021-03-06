import React from 'react';
import { OrderBy } from '../../../types';
import { Column, OrderDirection } from '../../types';
import ColumnHeader from './ColumnHeader';
import styles from './HeaderRow.module.scss';

export interface HeaderRowProps<T> {
  columns: Column<T>[];
  orderBy?: OrderBy;
  orderDirection?: OrderDirection;
  onOrderBy?: (orderBy: OrderBy) => void;
}

function getNextOrderDirection(
  orderField: string,
  currentOrderBy?: OrderBy
): OrderDirection {
  if (!currentOrderBy || orderField !== currentOrderBy?.orderField) {
    return OrderDirection.ASC;
  }
  return currentOrderBy?.orderDirection === OrderDirection.ASC
    ? OrderDirection.DESC
    : OrderDirection.ASC;
}

const HeaderRow = <T,>({
  columns,
  orderBy,
  onOrderBy,
}: HeaderRowProps<T>): React.ReactElement => (
  <tr className={styles['header-row']}>
    {columns.map(({ name, field, sortable }) => (
      <ColumnHeader
        key={field}
        title={name}
        sortable={sortable}
        orderDirection={
          orderBy?.orderField === field ? orderBy?.orderDirection : null
        }
        onClick={
          sortable && onOrderBy
            ? () =>
                onOrderBy({
                  orderField: field,
                  orderDirection: getNextOrderDirection(field, orderBy),
                })
            : undefined
        }
      />
    ))}
  </tr>
);

export default HeaderRow;
