import classNames from 'classnames';
import { IconSort, IconSortAscending, IconSortDescending } from 'hds-react';
import React from 'react';
import { OrderDirection } from '../../types';
import styles from './ColumnHeader.module.scss';

export interface ColumnHeaderProps {
  title: string;
  sortable: boolean;
  orderDirection?: OrderDirection | null;
  onClick?: () => void;
}

const ColumnHeader = ({
  title,
  sortable,
  orderDirection,
  onClick,
}: ColumnHeaderProps): React.ReactElement => (
  <th
    className={classNames(styles.columnHeader, {
      [styles.selected]: orderDirection !== null,
    })}>
    <button
      className={classNames(styles.sortButton)}
      type="button"
      onClick={onClick}>
      <span className={styles.title}>{title}</span>
      {sortable && orderDirection === null && (
        <IconSort className={styles.sortIcon} />
      )}
      {sortable && orderDirection === OrderDirection.DESC && (
        <IconSortDescending className={styles.sortIcon} />
      )}
      {sortable && orderDirection === OrderDirection.ASC && (
        <IconSortAscending className={styles.sortIcon} />
      )}
    </button>
  </th>
);

export default ColumnHeader;
