import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatus } from '../../types';
import styles from './StatusLabel.module.scss';

export interface StatusLabeProps {
  status: ParkingPermitStatus;
}

const StatusLabel = ({ status }: StatusLabeProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusLabelMapping: { [key in ParkingPermitStatus]: string } = {
    [ParkingPermitStatus.CANCELLED]: t('permitStatus.cancelled'),
    [ParkingPermitStatus.DRAFT]: t('permitStatus.draft'),
    [ParkingPermitStatus.EXPIRED]: t('permitStatus.expired'),
    [ParkingPermitStatus.VALID]: t('permitStatus.valid'),
  };
  const statusStyleName = ParkingPermitStatus[status].toLowerCase();
  return (
    <div className={`${styles.container}`}>
      <div className={styles[statusStyleName]} />
      {statusLabelMapping[status]}
    </div>
  );
};

export default StatusLabel;
