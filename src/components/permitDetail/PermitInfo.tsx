import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail, PermitEndType } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import Divider from '../common/Divider';
import StatusLabel from '../common/StatusLabel';
import FieldItem from './FieldItem';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.permitDetail.permitInfo';
export interface PermitInfoProps {
  className?: string;
  endType?: PermitEndType;
  permit: PermitDetail;
}

const PermitInfo = ({
  className,
  endType,
  permit,
}: PermitInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const {
    contractType,
    monthCount,
    startTime,
    endTime,
    status,
    currentPeriodEndTime,
    description,
  } = permit;
  let endTimeValue = '';
  if (endType === PermitEndType.IMMEDIATELY) {
    endTimeValue = formatDateTimeDisplay(new Date());
  } else if (endType === PermitEndType.AFTER_CURRENT_PERIOD) {
    endTimeValue = formatDateTimeDisplay(currentPeriodEndTime);
  } else {
    endTimeValue = endTime ? formatDateTimeDisplay(endTime) : '-';
  }
  const contractTypeLabelMapping = {
    FIXED_PERIOD: t('contractType.fixedPeriod'),
    OPEN_ENDED: t('contractType.openEnded'),
  };
  const fields = [
    {
      label: t(`${T_PATH}.contractType`),
      value: contractTypeLabelMapping[contractType] || '-',
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
      value: endTimeValue,
    },
    {
      label: t(`${T_PATH}.status`),
      value: <StatusLabel status={status} />,
    },
    {
      label: t(`${T_PATH}.additionalInfo`),
      value: description,
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
