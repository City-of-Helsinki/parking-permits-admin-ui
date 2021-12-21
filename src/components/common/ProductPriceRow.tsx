import React from 'react';
import { PriceModifiers, Product } from '../../types';
import {
  formatDateDisplay,
  formatMonthlyPrice,
  getProductPrice,
} from '../../utils';
import styles from './ProductPriceRow.module.scss';

export interface ProductPriceRowProps {
  className?: string;
  product: Product;
  priceModifiers: PriceModifiers;
}

const ProductPriceRow = ({
  className,
  product,
  priceModifiers,
}: ProductPriceRowProps): React.ReactElement => {
  const { isLowEmission, isSecondaryVehicle } = priceModifiers;
  const { unitPrice, startDate, endDate } = product;
  const isPriceModified = isLowEmission || isSecondaryVehicle;
  const modifiedPrice = getProductPrice(product, 1, priceModifiers);
  return (
    <div className={className}>
      {isPriceModified && (
        <>
          <span className={styles.modifiedPrice}>
            <b>{formatMonthlyPrice(modifiedPrice)}</b>
          </span>
          <span className={styles.originalPrice}>
            <s>{formatMonthlyPrice(unitPrice)}</s>
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

export default ProductPriceRow;
