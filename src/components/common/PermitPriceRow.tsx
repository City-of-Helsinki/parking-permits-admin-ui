import React from 'react';
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
  const { originalUnitPrice, unitPrice, startDate, endDate } = permitPrice;
  const isPriceModified = originalUnitPrice !== unitPrice;
  return (
    <div className={className}>
      {isPriceModified && (
        <>
          <span className={styles.modifiedPrice}>
            <b>{formatMonthlyPrice(unitPrice)}</b>
          </span>
          <span className={styles.originalPrice}>
            <s>{formatMonthlyPrice(originalUnitPrice)}</s>
          </span>
        </>
      )}
      {!isPriceModified && (
        <span className={styles.originalPrice}>
          {formatMonthlyPrice(unitPrice)}
        </span>
      )}
      <span className={styles.dateRange}>
        {`(${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)})`}
      </span>
    </div>
  );
};

export default PermitPriceRow;
