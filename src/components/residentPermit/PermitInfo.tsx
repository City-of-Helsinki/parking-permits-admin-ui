import { addDays, addMonths, endOfDay } from 'date-fns';
import { DateInput, NumberInput, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Language, PermitInfoDetail } from '../../types';
import { formatDateDisplay, formatDateTimeDisplay } from '../../utils';
import Divider from '../common/Divider';
import StatusSelect from '../permits/StatusSelect';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.createResidentPermit.permitInfo';

interface PermitInfoProps {
  className?: string;
  editMode?: boolean;
  permit: PermitInfoDetail;
  onUpdateField: (field: keyof PermitInfoDetail, value: unknown) => void;
}

const PermitInfo = ({
  className,
  editMode = false,
  permit,
  onUpdateField,
}: PermitInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const expirationDate = endOfDay(
    addDays(addMonths(new Date(permit.startTime), permit.monthCount), -1)
  );
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
          readOnly={editMode}
          className={styles.fieldItem}
          id="validPeriodInMonths"
          label={t(`${T_PATH}.validPeriodInMonths`)}
          step={1}
          min={1}
          max={12}
          value={permit.monthCount}
          onChange={e =>
            onUpdateField('monthCount', parseInt(e.target.value, 10))
          }
        />
        <DateInput
          required
          readOnly={editMode}
          className={styles.fieldItem}
          id="startDate"
          initialMonth={new Date()}
          label={t(`${T_PATH}.startDate`)}
          language={i18n.language as Language}
          value={formatDateDisplay(permit.startTime)}
          onChange={(value, date) =>
            onUpdateField('startTime', date.toISOString())
          }
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
          value={formatDateTimeDisplay(expirationDate)}
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
