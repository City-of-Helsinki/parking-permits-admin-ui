import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo } from '../../types';
import { Column } from '../types';
import styles from './DataTable.module.scss';
import Paginator from './paginator/Paginator';
import Table from './table/Table';

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageInfo?: PageInfo;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onPage?: (page: number) => void;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
}

const T_PATH = 'components.common.dataTable';

const DataTable = <T,>({
  columns,
  data,
  loading = false,
  pageInfo,
  orderBy,
  rowIdSelector,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: DataTableProps<T>): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={styles.dataTable}>
      <div className={styles.header}>
        {pageInfo && (
          <div className={styles.totalInfo}>
            {t(`${T_PATH}.results`, { count: pageInfo.count })}
          </div>
        )}
        {onExport && (
          <Button theme="black" variant="secondary" onClick={() => onExport()}>
            {t(`${T_PATH}.export`)}
          </Button>
        )}
      </div>
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
};

export default DataTable;
