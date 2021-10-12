import React from 'react';
import styles from './NoDataRow.module.scss';

export interface NoDataRowProps {
  colSpan: number;
  text: string;
}

const NoDataRow = ({ colSpan, text }: NoDataRowProps): React.ReactElement => (
  <tr className={styles['no-data-row']}>
    <td colSpan={colSpan}>{text}</td>
  </tr>
);

export default NoDataRow;
