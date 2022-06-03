import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefundStatus, RefundStatusOrAll } from '../../types';
import styles from './RefundStatusLabel.module.scss';

export interface RefundStatusLabelProps {
  status: RefundStatusOrAll;
}

const RefundStatusLabel = ({
  status,
}: RefundStatusLabelProps): React.ReactElement => {
  const { t } = useTranslation();
  const labelMapping = {
    ALL: t('refundStatus.all'),
    [RefundStatus.OPEN]: t('refundStatus.open'),
    [RefundStatus.REQUEST_FOR_APPROVAL]: t('refundStatus.requestForApproval'),
    [RefundStatus.ACCEPTED]: t('refundStatus.accepted'),
    [RefundStatus.REJECTED]: t('refundStatus.rejected'),
  };
  const statusStyleMapping = {
    ALL: styles.all,
    [RefundStatus.OPEN]: styles.open,
    [RefundStatus.REQUEST_FOR_APPROVAL]: styles.requestForApproval,
    [RefundStatus.ACCEPTED]: styles.accepted,
    [RefundStatus.REJECTED]: styles.rejected,
  };
  return (
    <div className={`${styles.container}`}>
      <div className={statusStyleMapping[status]} />
      {labelMapping[status]}
    </div>
  );
};

export default RefundStatusLabel;
