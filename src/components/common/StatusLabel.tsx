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
    [ParkingPermitStatus.DRAFT]: t('permitStatus.draft'),
    [ParkingPermitStatus.PRELIMINARY]: t('permitStatus.preliminary'),
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: t(
      'permitStatus.paymentInProgress'
    ),
    [ParkingPermitStatus.VALID]: t('permitStatus.valid'),
    [ParkingPermitStatus.CANCELLED]: t('permitStatus.cancelled'),
    [ParkingPermitStatus.CLOSED]: t('permitStatus.closed'),
  };
  const statusStyleMapping = {
    [ParkingPermitStatus.DRAFT]: styles.draft,
    [ParkingPermitStatus.PRELIMINARY]: styles.preliminary,
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: styles.paymentInProgress,
    [ParkingPermitStatus.VALID]: styles.valid,
    [ParkingPermitStatus.CANCELLED]: styles.cancelled,
    [ParkingPermitStatus.CLOSED]: styles.closed,
  };
  return (
    <div className={`${styles.container}`}>
      <div className={statusStyleMapping[status]} />
      {statusLabelMapping[status]}
    </div>
  );
};

export default StatusLabel;
