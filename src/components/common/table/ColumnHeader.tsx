import { IconAngleUp, IconDocument } from 'hds-react';
import React from 'react';
import { OrderDirection } from '../../types';
import styles from './ColumnHeader.module.scss';

export interface ColumnHeaderProps {
  title: string;
  field: string;
  direction?: OrderDirection | null;
  onOrderBy: (field: string, direction: OrderDirection) => void;
}

const ColumnHeader = ({
  title,
  field,
  direction,
  onOrderBy,
}: ColumnHeaderProps): React.ReactElement => (
  <th
    onClick={() =>
      onOrderBy(
        field,
        direction === OrderDirection.ASC
          ? OrderDirection.DESC
          : OrderDirection.ASC
      )
    }>
    <div className={styles['column-header']}>
      <span>{title}</span>
      {direction === null && <IconAngleUp className={styles['hover-icon']} />}
      {direction === OrderDirection.DESC && <IconDocument />}
      {direction === OrderDirection.ASC && <IconAngleUp />}
    </div>
  </th>
);

export default ColumnHeader;
