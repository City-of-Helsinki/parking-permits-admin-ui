import { RadioButton, TextInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitPriceChange } from '../../types';
import {
  formatDateDisplay,
  formatMonthlyPrice,
  isValidIBAN,
} from '../../utils';
import Divider from '../common/Divider';
import styles from './PermitPriceChangeInfo.module.scss';

const T_PATH = 'components.permitDetail.permitPriceChangeInfo';

enum PriceChangeType {
  HIGHER_PRICE,
  LOWER_PRICE,
  NO_CHANGE,
}

interface PriceChangeItemProps {
  className?: string;
  type: PriceChangeType;
  priceChangeItem: PermitPriceChange;
}

const PriceChangeItem = ({
  className,
  type,
  priceChangeItem,
}: PriceChangeItemProps): React.ReactElement => {
  const { t } = useTranslation();
  const { product, newPrice, priceChange, startDate, endDate, monthCount } =
    priceChangeItem;
  const monthlyPriceLabel =
    type === PriceChangeType.HIGHER_PRICE
      ? `${formatMonthlyPrice(priceChange)} (${formatMonthlyPrice(newPrice)})`
      : formatMonthlyPrice(newPrice);
  return (
    <div className={className}>
      <div className={styles.row}>
        <div>
          <b>{product}</b>
        </div>
        <div>
          <span>{monthlyPriceLabel}</span>
        </div>
      </div>
      <div className={styles.row}>
        <div>
          {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
        </div>
      </div>
      <div className={styles.row}>
        <div>
          {t(`${T_PATH}.priceChangeItemTotalLabel`, { count: monthCount })}
        </div>
        <div>
          <b>{formatMonthlyPrice(newPrice * monthCount)}</b>
        </div>
      </div>
    </div>
  );
};

enum RefundAccountOption {
  KNOWN = 'known',
  UNKNOWN = 'unknown',
}

export interface PermitPriceChangeInfoProps {
  className?: string;
  priceChangeList: PermitPriceChange[];
  refundAccountNumber: string;
  onChangeRefundAccountNumber: (account: string) => void;
}

const PermitPriceChangeInfo = ({
  className,
  priceChangeList,
  refundAccountNumber,
  onChangeRefundAccountNumber,
}: PermitPriceChangeInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const [refundAccountOption, setRefundAccountOption] = useState(
    RefundAccountOption.KNOWN
  );
  const newOrderTotal = priceChangeList.reduce(
    (total, item) => total + item.newPrice * item.monthCount,
    0
  );
  const previousOrderRemaining = priceChangeList.reduce(
    (total, item) => total + item.previousPrice * item.monthCount,
    0
  );
  const priceChangeTotal = priceChangeList.reduce(
    (total, item) => total + item.priceChange * item.monthCount,
    0
  );
  const priceChangeVatTotal = priceChangeList.reduce(
    (total, item) => total + item.priceChangeVat * item.monthCount,
    0
  );
  let priceChangeType = PriceChangeType.NO_CHANGE;
  if (priceChangeTotal > 0) {
    priceChangeType = PriceChangeType.HIGHER_PRICE;
  } else if (priceChangeTotal < 0) {
    priceChangeType = PriceChangeType.LOWER_PRICE;
  } else {
    priceChangeType = PriceChangeType.NO_CHANGE;
  }
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        <div className={styles.priceChanges}>
          {priceChangeList.map((priceChange, index) => (
            <>
              <PriceChangeItem
                key={`${priceChange.product}-${priceChange.startDate}`}
                className={styles.priceChangeItem}
                type={priceChangeType}
                priceChangeItem={priceChange}
              />
              {index < priceChangeList.length - 1 && <Divider />}
            </>
          ))}
        </div>
        <div className={styles.totalInfo}>
          <div className={styles.row}>
            <div>{t(`${T_PATH}.newOrderTotal`)}</div>
            <div>{newOrderTotal} ???</div>
          </div>
          <div className={styles.row}>
            <div>{t(`${T_PATH}.previousOrderRemaining`)}</div>
            <div>{-previousOrderRemaining} ???</div>
          </div>
          <Divider />
          <div className={styles.row}>
            <div>{t(`${T_PATH}.priceDifference`)}</div>
            <div>{priceChangeTotal} ???</div>
          </div>
          <div className={styles.row}>
            <div>{t(`${T_PATH}.priceCalcDescription`)}</div>
          </div>
        </div>
        {priceChangeType === PriceChangeType.HIGHER_PRICE && (
          <div className={styles.extraPayment}>
            <div className={styles.row}>
              <div>
                <b>{t(`${T_PATH}.extraPaymentTotal`)}</b>
              </div>
              <div>
                <b>{priceChangeTotal} ???</b>
              </div>
            </div>
            <div className={styles.row}>
              <div>{t(`${T_PATH}.extraPaymentVatTotal`)}</div>
              <div>{priceChangeVatTotal} ???</div>
            </div>
          </div>
        )}
        {priceChangeType === PriceChangeType.LOWER_PRICE && (
          <>
            <div className={styles.refund}>
              <div className={styles.row}>
                <div>
                  <b>{t(`${T_PATH}.refundTotal`)}</b>
                </div>
                <div>
                  <b>{-priceChangeTotal} ???</b>
                </div>
              </div>
              <div className={styles.row}>
                <div>{t(`${T_PATH}.refundTotalVat`)}</div>
                <div>{-priceChangeVatTotal} ???</div>
              </div>
            </div>
            <div className={styles.ibanInfo}>
              <RadioButton
                id="customerAccountKnown"
                name="accountNumberOption"
                label={t(`${T_PATH}.customerAccountKnown`)}
                value={RefundAccountOption.KNOWN}
                checked={refundAccountOption === RefundAccountOption.KNOWN}
                onChange={e =>
                  setRefundAccountOption(e.target.value as RefundAccountOption)
                }
              />
              <TextInput
                className={styles.accountNumber}
                required
                id="iban"
                label="IBAN"
                disabled={refundAccountOption !== RefundAccountOption.KNOWN}
                value={refundAccountNumber}
                onChange={e => onChangeRefundAccountNumber(e.target.value)}
                errorText={
                  isValidIBAN(refundAccountNumber)
                    ? undefined
                    : t('errors.invalidIBAN')
                }
              />
              <RadioButton
                id="customerAccountUnknown"
                name="accountNumberOption"
                label={t(`${T_PATH}.customerAccountUnknown`)}
                value={RefundAccountOption.UNKNOWN}
                checked={refundAccountOption === RefundAccountOption.UNKNOWN}
                onChange={e => {
                  setRefundAccountOption(e.target.value as RefundAccountOption);
                  onChangeRefundAccountNumber('');
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default PermitPriceChangeInfo;
