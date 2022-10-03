import React from 'react';
import styles from './NoDataRow.module.scss';

export interface NoDataRowProps {
  colSpan: number;
  text: string | React.ReactNode;
}

const NoDataRow = ({ colSpan, text }: NoDataRowProps): React.ReactElement => (
  <tr className={styles.noDataRow}>
    <td colSpan={colSpan}>
      <div className={styles.noDataContent}>{text}</div>
    </td>
  </tr>
);

export default NoDataRow;
