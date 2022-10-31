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
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: t(
      'permitStatus.paymentInProgress'
    ),
    [ParkingPermitStatus.VALID]: t('permitStatus.valid'),
    [ParkingPermitStatus.CLOSED]: t('permitStatus.closed'),
  };
  const statusStyleMapping = {
    [ParkingPermitStatus.PAYMENT_IN_PROGRESS]: styles.paymentInProgress,
    [ParkingPermitStatus.VALID]: styles.valid,
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
