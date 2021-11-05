import { DateInput, NumberInput, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FixedPeriodResidentPermit, Language } from '../../types';
import { formatDateTime } from '../../utils';
import Divider from '../common/Divider';
import StatusSelect from '../permits/StatusSelect';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.createResidentPermit.permitInfo';

function calculateExpirationDate(
  startTime: string,
  monthCount: number
): string {
  const date = new Date(startTime);
  let newMonth = date.getMonth() + monthCount;
  // eslint-disable-next-line no-magic-numbers
  if (newMonth > 12) {
    date.setFullYear(date.getFullYear() + 1);
    // eslint-disable-next-line no-magic-numbers
    newMonth -= 12;
  }
  date.setMonth(newMonth);
  return formatDateTime(date);
}

interface PermitInfoProps {
  className?: string;
  permit: FixedPeriodResidentPermit;
  onUpdateField: (
    field: keyof FixedPeriodResidentPermit,
    value: unknown
  ) => void;
}

const PermitInfo = ({
  className,
  permit,
  onUpdateField,
}: PermitInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const expirationDate = permit
    ? calculateExpirationDate(permit.startTime, permit.monthCount)
    : '';
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.permitInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          readOnly
          className={styles.fieldItem}
          id="contractType"
          label={t(`${T_PATH}.contractType`)}
          value={t('contractType.fixedPeriod')}
        />
        <NumberInput
          required
          className={styles.fieldItem}
          id="validPeriodInMonths"
          label={t(`${T_PATH}.validPeriodInMonths`)}
          step={1}
          value={permit.monthCount}
        />
        <DateInput
          required
          className={styles.fieldItem}
          id="startDate"
          initialMonth={new Date()}
          label={t(`${T_PATH}.startDate`)}
          language={i18n.language as Language}
          value={permit.startTime}
          onChange={value => onUpdateField('startTime', value)}
        />
        <TextInput
          readOnly
          className={styles.fieldItem}
          id="effectiveFrom"
          label={t(`${T_PATH}.effectiveFrom`)}
          value={t(`${T_PATH}.momentWhenPermitIsSaved`)}
        />
        <StatusSelect
          className={styles.fieldItem}
          value={permit.status}
          onChange={status => onUpdateField('status', status)}
        />
        <TextInput
          readOnly
          className={styles.fieldItem}
          id="expirationDate"
          label={t(`${T_PATH}.expirationDate`)}
          value={expirationDate}
        />
        <Divider className={styles.fieldDivider} />
        <TextArea
          className={styles.fieldItem}
          id="additionalInfo"
          label={t(`${T_PATH}.additionalInfo`)}
          placeholder={t(`${T_PATH}.additionalInfoPlaceholder`)}
        />
      </div>
    </div>
  );
};
export default PermitInfo;
