import React from 'react';
import { PageInfo } from '../../types';
import { Column, OrderDirection } from '../types';
import styles from './DataTable.module.scss';
import Paginator from './paginator/Paginator';
import Table from './table/Table';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pageInfo?: PageInfo;
  orderBy?: string;
  orderDirection?: OrderDirection;
  rowIdSelector: (row: T) => string | number;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: string, orderDirection: OrderDirection) => void;
}

const DataTable = <T,>({
  columns,
  data,
  loading,
  pageInfo,
  orderBy,
  orderDirection,
  rowIdSelector,
  onPage,
  onOrderBy,
}: DataTableProps<T>): React.ReactElement => (
  <div className={styles['data-table']}>
    <Table
      columns={columns}
      data={data}
      loading={loading}
      orderBy={orderBy}
      rowIdSelector={rowIdSelector}
      orderDirection={orderDirection}
      onOrderBy={onOrderBy}
    />
    {pageInfo && onPage && <Paginator pageInfo={pageInfo} onPage={onPage} />}
  </div>
);

export default DataTable;
