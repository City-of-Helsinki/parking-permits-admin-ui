import { TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail } from '../../types';
import { isValidIBAN } from '../../utils';
import styles from './RefundInfo.module.scss';

const T_PATH = 'components.permitDetail.refundInfo';
export interface RefundInfoProps {
  className?: string;
  iban: string;
  permit: PermitDetail;
  onChangeIban: (iban: string) => void;
}

const RefundInfo = ({
  className,
  iban,
  permit,
  onChangeIban,
}: RefundInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const { totalRefundAmount, canBeRefunded } = permit;
  const refundAmount = `${totalRefundAmount.toFixed(2)} €`;
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
        <div className={styles.refundDescription}>
          * {t(`${T_PATH}.orderRemaingDescription`)}
        </div>
        <div className={styles.refund}>
          <div className={styles.refundLabel}>{t(`${T_PATH}.refund`)}</div>
          <div className={styles.refundAmount}>{refundAmount}</div>
        </div>
        {canBeRefunded && totalRefundAmount > 0 && (
          <TextInput
            className={styles.iban}
            required
            id="iban"
            label="IBAN"
            value={iban}
            onChange={e => onChangeIban(e.target.value)}
            errorText={isValidIBAN(iban) ? undefined : t('errors.invalidIBAN')}
          />
        )}
      </div>
    </div>
  );
};
export default RefundInfo;
