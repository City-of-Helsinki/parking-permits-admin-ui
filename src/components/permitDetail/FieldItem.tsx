import React from 'react';
import styles from './FieldItem.module.scss';

export interface FieldItemProps {
  className?: string;
  label: string;
  value: React.ReactNode;
}

const FieldItem = ({
  className,
  label,
  value,
}: FieldItemProps): React.ReactElement => (
  <div className={className}>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);

export default FieldItem;
