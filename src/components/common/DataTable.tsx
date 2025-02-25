import { Button, Checkbox, IconDownload, Pagination } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Language, OrderBy, PageInfo } from '../../types';
import { Column } from '../types';
import styles from './DataTable.module.scss';
import Table from './table/Table';

export interface DataTableProps<T> {
  selection?: T[] | null;
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  pageInfo?: PageInfo;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onPage?: (page: number) => void;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
  onSelectionChange?: (rows: T[] | undefined) => void;
  showAllSelection?: boolean;
  showCheckbox?: boolean;
}

const T_PATH = 'components.common.dataTable';

const DataTable = <T,>({
  selection = null,
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
  onSelectionChange,
  showAllSelection = true,
  showCheckbox = true,
}: DataTableProps<T>): React.ReactElement => {
  const { i18n, t } = useTranslation();
  return (
    <div className={styles.dataTable}>
      <div className={styles.header}>
        {pageInfo && (
          <div className={styles.totalInfo}>
            {t(`${T_PATH}.results`, { count: pageInfo.count })}
          </div>
        )}
        {onExport && (
          <div>
            <Button
              variant="supplementary"
              size="small"
              iconRight={<IconDownload />}
              onClick={() => onExport()}>
              {t(`${T_PATH}.downloadCsv`)}
            </Button>
          </div>
        )}
      </div>
      {showAllSelection && selection && data && (
        <div className={styles.selectionActions}>
          <Checkbox
            id="checkbox-select-all"
            indeterminate={
              selection.length > 0 && selection.length < data.length
            }
            checked={selection.length === data.length}
            label={t(`${T_PATH}.selectAll`)}
            onChange={e =>
              onSelectionChange &&
              onSelectionChange(e.target.checked ? data : [])
            }
          />
        </div>
      )}
      <Table
        selection={selection}
        columns={columns}
        data={data}
        loading={loading}
        orderBy={orderBy}
        rowIdSelector={rowIdSelector}
        onOrderBy={onOrderBy}
        onRowClick={onRowClick}
        onSelectionChange={onSelectionChange}
        showCheckbox={showCheckbox}
      />
      {pageInfo && onPage && (
        <div className={styles['paginator-container']}>
          <Pagination
            language={i18n.language as Language}
            onChange={(event, index) => {
              event.preventDefault();
              onPage(index + 1);
            }}
            pageCount={pageInfo.numPages}
            pageHref={() => '#'}
            pageIndex={pageInfo.page - 1}
            paginationAriaLabel="Pagination"
            siblingCount={2}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
