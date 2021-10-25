import React from 'react';
import styles from './Divider.module.scss';

export interface DividerProps {
  spacing?: string;
}

const Divider = ({ spacing = '0' }: DividerProps): React.ReactElement => (
  <div
    className={styles.divider}
    style={{ marginTop: spacing, marginBottom: spacing }}
  />
);

export default Divider;
