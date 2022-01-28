import { TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail } from '../../types';
import { formatMonthlyPrice } from '../../utils';
import styles from './RefundInfoFixedPeriod.module.scss';

const T_PATH = 'components.permitDetail.refundInfoFixedPeriod';
export interface RefundInfoFixedPeriodProps {
  className?: string;
  iban: string;
  permit: PermitDetail;
  onChangeIban: (iban: string) => void;
}

const RefundInfoFixedPeriod = ({
  className,
  iban,
  permit,
  onChangeIban,
}: RefundInfoFixedPeriodProps): React.ReactElement => {
  const { t } = useTranslation();
  const { monthsLeft, monthlyPrice, canBeRefunded } = permit;
  const refundAmount = `${(-monthsLeft * monthlyPrice).toFixed(2)} €`;
  const amountLabel = t(`${T_PATH}.monthCount`, {
    count: monthsLeft,
  });
  const refundDetail = `${amountLabel}, ${formatMonthlyPrice(monthlyPrice)}`;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        <div className={styles.orderRemaining}>
          <div className={styles.orderRemainingLabel}>
            {t(`${T_PATH}.orderRemaining`)}
          </div>
          <div className={styles.orderRemainingAmount}>{refundAmount}</div>
        </div>
        <div className={styles.orderRemainingDetail}>{refundDetail}</div>
        <div className={styles.refundDescription}>
          * {t(`${T_PATH}.orderRemaingDescription`)}
        </div>
        <div className={styles.refund}>
          <div className={styles.refundLabel}>{t(`${T_PATH}.refund`)}</div>
          <div className={styles.refundAmount}>{refundAmount}</div>
        </div>
        {canBeRefunded ? (
          <TextInput
            className={styles.iban}
            required
            id="iban"
            label="IBAN"
            value={iban}
            onChange={e => onChangeIban(e.target.value)}
          />
        ) : (
          <div className={styles.refunded}>{t(`${T_PATH}.refunded`)}</div>
        )}
      </div>
    </div>
  );
};
export default RefundInfoFixedPeriod;
