import { IconAngleDown, IconAngleUp } from 'hds-react';
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
  <th style={{ cursor: sortable ? 'pointer' : 'default' }} onClick={onClick}>
    <div className={styles['column-header']}>
      <span>{title}</span>
      {sortable && orderDirection === null && (
        <IconAngleUp className={styles['hover-icon']} />
      )}
      {sortable && orderDirection === OrderDirection.DESC && <IconAngleDown />}
      {sortable && orderDirection === OrderDirection.ASC && <IconAngleUp />}
    </div>
  </th>
);

export default ColumnHeader;
