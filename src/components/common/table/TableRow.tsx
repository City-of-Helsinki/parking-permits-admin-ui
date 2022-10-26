import classNames from 'classnames';
import { Checkbox } from 'hds-react';
import React from 'react';
import { Column } from '../../types';
import styles from './TableRow.module.scss';

export interface TableRowProps<T> {
  rowId: string;
  selected?: boolean | null;
  columns: Column<T>[];
  row: T;
  onClick?: (row: T) => void;
  showCheckbox?: boolean;
  onSelectionChange?: (checked: boolean) => void;
}

const TableRow = <T,>({
  rowId,
  selected = null,
  columns,
  row,
  onClick,
  onSelectionChange,
  showCheckbox = true,
}: TableRowProps<T>): React.ReactElement => (
  <tr
    className={classNames(styles.tableRow, { [styles.clickable]: onClick })}
    onClick={() => {
      if (onClick) {
        onClick(row);
      }
    }}>
    {columns.map(({ field, selector }, index) => {
      if (index === 0 && selected !== null) {
        return (
          <td key={field}>
            <div className={styles.tableCell}>
              {showCheckbox && (
                <Checkbox
                  className={styles.checkbox}
                  id={`checkbox-${rowId}`}
                  label={selector(row)}
                  checked={selected}
                  onClick={e => {
                    e.stopPropagation();
                    if (onSelectionChange) {
                      onSelectionChange(!selected);
                    }
                  }}
                />
              )}
              {!showCheckbox && selector(row)}
            </div>
          </td>
        );
      }
      return (
        <td key={field}>
          <div className={styles.tableCell}>{selector(row)}</div>
        </td>
      );
    })}
  </tr>
);

export default TableRow;
