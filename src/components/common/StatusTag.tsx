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
    [ParkingPermitStatus.DRAFT]: t('permitStatus.draft'),
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: t(
      'permitStatus.paymentInProgress'
    ),
    [ParkingPermitStatus.VALID]: t('permitStatus.valid'),
    [ParkingPermitStatus.CLOSED]: t('permitStatus.closed'),
  };
  const statusStyleMapping = {
    [ParkingPermitStatus.DRAFT]: styles.draft,
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: styles.paymentInProgress,
    [ParkingPermitStatus.VALID]: styles.valid,
    [ParkingPermitStatus.CLOSED]: styles.closed,
  };
  return (
    <div className={`${styles.tag} ${statusStyleMapping[status]}`}>
      {statusLabelMapping[status]}
    </div>
  );
};

export default StatusTag;
