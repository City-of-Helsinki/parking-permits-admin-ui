import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import Divider from '../common/Divider';
import StatusLabel from '../common/StatusLabel';
import FieldItem from './FieldItem';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.permitDetail.permitInfo';
export interface PermitInfoProps {
  className?: string;
  permit: PermitDetail;
}

const PermitInfo = ({
  className,
  permit,
}: PermitInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const { contractType, monthCount, startTime, endTime, status } = permit;
  const fields = [
    {
      label: t(`${T_PATH}.contractType`),
      value: contractType,
    },
    {
      label: t(`${T_PATH}.validPeriod`),
      value: monthCount,
    },
    {
      label: t(`${T_PATH}.startTime`),
      value: formatDateTimeDisplay(startTime),
    },
    {
      label: t(`${T_PATH}.endTime`),
      value: endTime ? formatDateTimeDisplay(endTime) : '-',
    },
    {
      label: t(`${T_PATH}.status`),
      value: <StatusLabel status={status} />,
    },
    {
      label: t(`${T_PATH}.additionalInfo`),
      value: '-',
    },
  ];
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
        <Divider className={styles.divider} />
        <FieldItem
          label={t(`${T_PATH}.monthsLeft`)}
          value={permit.monthsLeft || '-'}
        />
      </div>
    </div>
  );
};
export default PermitInfo;
