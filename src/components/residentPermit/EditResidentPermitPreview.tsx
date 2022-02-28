import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail, PermitPriceChange } from '../../types';
import CustomerInfo from '../permitDetail/CustomerInfo';
import PermitInfo from '../permitDetail/PermitInfo';
import PermitPriceChangeInfo from '../permitDetail/PermitPriceChangeInfo';
import VehicleInfo from '../permitDetail/VehicleInfo';
import styles from './EditResidentPermitPreview.module.scss';

const T_PATH = 'components.residentPermit.editResidentPermitPreview';

interface EditResidentPermitPreviewProps {
  className?: string;
  permit: PermitDetail;
  priceChangeList: PermitPriceChange[];
  onCancel: () => void;
  onConfirm: (refundAccountNumber: string) => void;
}

const EditResidentPermitPreview = ({
  className,
  permit,
  priceChangeList,
  onCancel,
  onConfirm,
}: EditResidentPermitPreviewProps): React.ReactElement => {
  const { t } = useTranslation();
  const [refundAccountNumber, setRefundAccountNumber] = useState('');

  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <div className={styles.column}>
          <VehicleInfo className={styles.vehicleInfo} permit={permit} />
          <CustomerInfo className={styles.customerInfo} permit={permit} />
        </div>
        <div className={styles.column}>
          <PermitInfo className={styles.permitInfo} permit={permit} />
        </div>
        <div className={styles.column}>
          <PermitPriceChangeInfo
            className={styles.permitPriceChange}
            priceChangeList={priceChangeList}
            refundAccountNumber={refundAccountNumber}
            onChangeRefundAccountNumber={accountNumber =>
              setRefundAccountNumber(accountNumber)
            }
          />
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionButton}
          variant="secondary"
          onClick={() => onCancel()}>
          {t(`${T_PATH}.goBack`)}
        </Button>
        <Button
          className={styles.actionButton}
          iconLeft={<IconCheckCircleFill />}
          onClick={() => onConfirm(refundAccountNumber)}>
          {t(`${T_PATH}.save`)}
        </Button>
      </div>
    </div>
  );
};
export default EditResidentPermitPreview;
