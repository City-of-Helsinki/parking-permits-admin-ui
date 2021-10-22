import React from 'react';
import styles from './Zone.module.scss';

export interface ZoneProps {
  name: string;
}

const Zone = ({ name }: ZoneProps): React.ReactElement => (
  <div className={styles.zone}>{name}</div>
);

export default Zone;
