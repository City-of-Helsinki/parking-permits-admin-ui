import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitPrice } from '../../types';
import { formatDateDisplay, formatMonthlyPrice } from '../../utils';
import styles from './PermitPriceRow.module.scss';

export interface PermitPriceRowProps {
  className?: string;
  permitPrice: PermitPrice;
}

const PermitPriceRow = ({
  className,
  permitPrice,
}: PermitPriceRowProps): React.ReactElement => {
  const { t } = useTranslation();
  const { unitPrice, startDate, endDate } = permitPrice;
  return (
    <div className={className}>
      <span className={styles.modifiedPrice}>
        {formatMonthlyPrice(unitPrice, t)}
      </span>
      <span className={styles.dateRange}>
        {`(${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)})`}
      </span>
    </div>
  );
};

export default PermitPriceRow;
