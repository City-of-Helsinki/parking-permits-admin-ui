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
  const { originalUnitPrice, unitPrice, startDate, endDate } = permitPrice;
  const isPriceModified = originalUnitPrice !== unitPrice;
  return (
    <div className={className}>
      {isPriceModified && (
        <>
          <span className={styles.modifiedPrice}>
            <b>{formatMonthlyPrice(unitPrice, t)}</b>
          </span>
          <span className={styles.originalPrice}>
            <s>{formatMonthlyPrice(originalUnitPrice, t)}</s>
          </span>
        </>
      )}
      {!isPriceModified && (
        <span className={styles.originalPrice}>
          {formatMonthlyPrice(unitPrice, t)}
        </span>
      )}
      <span className={styles.dateRange}>
        {`(${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)})`}
      </span>
    </div>
  );
};

export default PermitPriceRow;
