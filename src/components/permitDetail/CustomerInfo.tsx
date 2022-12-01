import React from 'react';
import { useTranslation } from 'react-i18next';
import useUserRole, { UserRole } from '../../api/useUserRole';
import { PermitDetail } from '../../types';
import { formatAddress } from '../../utils';
import styles from './CustomerInfo.module.scss';
import FieldItem from './FieldItem';

const T_PATH = 'components.permitDetail.customerInfo';

export interface CustomerInfoProps {
  className?: string;
  permit: PermitDetail;
}

const CustomerInfo = ({
  className,
  permit,
}: CustomerInfoProps): React.ReactElement => {
  const userRole = useUserRole();
  const { t, i18n } = useTranslation();
  const { customer, parkingZone } = permit;
  let fields = [
    {
      label: t(`${T_PATH}.personalID`),
      value: customer.nationalIdNumber || '-',
    },
    {
      label: t(`${T_PATH}.primaryAddress`),
      value: customer?.primaryAddress
        ? formatAddress(customer.primaryAddress, i18n.language)
        : '-',
    },
    {
      label: t(`${T_PATH}.otherAddress`),
      value: customer?.otherAddress
        ? formatAddress(customer.otherAddress, i18n.language)
        : '-',
    },
    {
      label: t(`${T_PATH}.parkingZone`),
      value: i18n.language === 'sv' ? parkingZone.labelSv : parkingZone.label,
    },
    {
      label: t(`${T_PATH}.phoneNumber`),
      value: customer.phoneNumber || '-',
    },
    {
      label: t(`${T_PATH}.email`),
      value: customer.email || '-',
    },
  ];
  if (userRole <= UserRole.INSPECTORS) {
    fields = [
      {
        label: t(`${T_PATH}.parkingZone`),
        value: i18n.language === 'sv' ? parkingZone.labelSv : parkingZone.label,
      },
    ];
  }
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        {fields.map(({ label, value }) => (
          <FieldItem
            key={label}
            className={styles.fieldItem}
            label={label}
            value={value}
          />
        ))}
      </div>
    </div>
  );
};
export default CustomerInfo;
