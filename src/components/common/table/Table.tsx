import { LoadingSpinner } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy } from '../../../types';
import { Column } from '../../types';
import HeaderRow from './HeaderRow';
import NoDataRow from './NoDataRow';
import styles from './Table.module.scss';
import TableRow from './TableRow';

export interface TableProps<T> {
  selection?: T[] | null;
  columns: Column<T>[];
  data: T[] | undefined;
  loading: boolean;
  showCheckbox?: boolean;
  orderBy?: OrderBy;
  rowIdSelector: (row: T) => string | number;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (rows: T[]) => void;
}

const T_PATH = 'components.common.table';

const Table = <T,>({
  selection = null,
  columns,
  data,
  loading,
  orderBy,
  rowIdSelector,
  onOrderBy,
  onRowClick,
  onSelectionChange,
  showCheckbox = true,
}: TableProps<T>): React.ReactElement => {
  const { t } = useTranslation();

  let tableBody;
  if (loading) {
    tableBody = (
      <NoDataRow colSpan={columns.length} text={<LoadingSpinner />} />
    );
  } else if (!data) {
    tableBody = (
      <NoDataRow colSpan={columns.length} text={t(`${T_PATH}.initialText`)} />
    );
  } else if (data.length === 0) {
    tableBody = (
      <NoDataRow colSpan={columns.length} text={t(`${T_PATH}.noResults`)} />
    );
  } else {
    tableBody = data.map(row => {
      const rowId = rowIdSelector(row);
      return (
        <TableRow
          selected={
            selection
              ? selection.some(
                  selectedRow => rowIdSelector(selectedRow) === rowId
                )
              : null
          }
          showCheckbox={showCheckbox}
          onClick={onRowClick}
          key={rowId}
          rowId={rowId.toString()}
          columns={columns}
          row={row}
          onSelectionChange={checked => {
            if (!onSelectionChange) {
              return;
            }
            const currentSelection = selection || [];
            const newSelection = checked
              ? [...currentSelection, row]
              : currentSelection.filter(
                  selectedRow => rowIdSelector(selectedRow) !== rowId
                );
            onSelectionChange(newSelection);
          }}
        />
      );
    });
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
