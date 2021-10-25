import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatus } from '../../types';
import styles from './StatusTag.module.scss';

export interface StatusTagProps {
  status: ParkingPermitStatus;
}

const StatusTag = ({ status }: StatusTagProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusLabelMapping: { [key in ParkingPermitStatus]: string } = {
    [ParkingPermitStatus.CANCELLED]: t('permitStatus.cancelled'),
    [ParkingPermitStatus.DRAFT]: t('permitStatus.draft'),
    [ParkingPermitStatus.EXPIRED]: t('permitStatus.expired'),
    [ParkingPermitStatus.VALID]: t('permitStatus.valid'),
  };
  const statusStyleName = ParkingPermitStatus[status].toLowerCase();
  return (
    <div className={`${styles.tag} ${styles[statusStyleName]}`}>
      {statusLabelMapping[status]}
    </div>
  );
};

export default StatusTag;
