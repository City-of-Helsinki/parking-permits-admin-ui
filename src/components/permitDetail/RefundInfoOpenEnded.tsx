import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail } from '../../types';
import { formatMonthlyPrice } from '../../utils';
import styles from './RefundInfoOpenEnded.module.scss';

const T_PATH = 'components.permitDetail.refundInfoOpenEnded';
export interface RefundInfoOpenEndedProps {
  className?: string;
  permit: PermitDetail;
}

const RefundInfoOpenEnded = ({
  className,
  permit,
}: RefundInfoOpenEndedProps): React.ReactElement => {
  const { t } = useTranslation();
  const { monthlyPrice } = permit;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        <div className={styles.monthlyPrice}>
          <div className={styles.monthlyPriceLabel}>
            {t(`${T_PATH}.monthlyPrice`)}
          </div>
          <div className={styles.monthlyPriceAmount}>
            {formatMonthlyPrice(monthlyPrice)}
          </div>
        </div>
        <div className={styles.refund}>
          <div className={styles.refundLabel}>{t(`${T_PATH}.refund`)}</div>
          <div className={styles.refundAmount}>0 €</div>
        </div>
      </div>
    </div>
  );
};
export default RefundInfoOpenEnded;
