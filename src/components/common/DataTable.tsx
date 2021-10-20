import React from 'react';
import { OrderBy, PageInfo } from '../../types';
import { Column } from '../types';
import styles from './DataTable.module.scss';
import Paginator from './paginator/Paginator';
import Table from './table/Table';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pageInfo?: PageInfo;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
}

const DataTable = <T,>({
  columns,
  data,
  loading,
  pageInfo,
  orderBy,
  rowIdSelector,
  onPage,
  onOrderBy,
  onRowClick,
}: DataTableProps<T>): React.ReactElement => (
  <div className={styles['data-table']}>
    <Table
      columns={columns}
      data={data}
      loading={loading}
      orderBy={orderBy}
      rowIdSelector={rowIdSelector}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
    />
    {pageInfo && onPage && <Paginator pageInfo={pageInfo} onPage={onPage} />}
  </div>
);

export default DataTable;
