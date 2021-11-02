import React from 'react';
import styles from './Divider.module.scss';

export interface DividerProps {
  className?: string;
}

const Divider = ({ className }: DividerProps): React.ReactElement => (
  <div
    className={className ? `${styles.divider} ${className}` : styles.divider}
  />
);

export default Divider;
