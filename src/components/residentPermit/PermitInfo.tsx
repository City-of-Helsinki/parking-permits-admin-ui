import { addDays, addMonths, endOfDay } from 'date-fns';
import { DateInput, NumberInput, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Language, ParkingPermitStatus, PermitDetail } from '../../types';
import { formatDateDisplay, formatDateTimeDisplay } from '../../utils';
import Divider from '../common/Divider';
import StatusSelect from '../permits/StatusSelect';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.residentPermit.permitInfo';

interface PermitInfoProps {
  className?: string;
  editMode?: boolean;
  permit: PermitDetail;
  onUpdatePermit: (permit: PermitDetail) => void;
}

const PermitInfo = ({
  className,
  editMode = false,
  permit,
  onUpdatePermit,
}: PermitInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const expirationDate = endOfDay(
    addDays(addMonths(new Date(permit.startTime), permit.monthCount), -1)
  );
  const contractTypeLabelMapping = {
    FIXED_PERIOD: t('contractType.fixedPeriod'),
    OPEN_ENDED: t('contractType.openEnded'),
  };
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
          value={contractTypeLabelMapping[permit.contractType] || '-'}
        />
        <NumberInput
          required
          disabled={editMode}
          className={styles.fieldItem}
          id="validPeriodInMonths"
          label={t(`${T_PATH}.validPeriodInMonths`)}
          step={1}
          min={1}
          max={12}
          value={permit.monthCount}
          onChange={e =>
            onUpdatePermit({
              ...permit,
              monthCount: parseInt(e.target.value, 10),
            })
          }
        />
        <DateInput
          required
          disabled={editMode}
          className={styles.fieldItem}
          id="startDate"
          initialMonth={new Date()}
          label={t(`${T_PATH}.startDate`)}
          language={i18n.language as Language}
          value={formatDateDisplay(permit.startTime)}
          onChange={(value, date) =>
            onUpdatePermit({ ...permit, startTime: date.toISOString() })
          }
        />
        <TextInput
          readOnly
          className={styles.fieldItem}
          id="effectiveFrom"
          label={t(`${T_PATH}.effectiveFrom`)}
          value={formatDateTimeDisplay(permit.startTime)}
        />
        <StatusSelect
          className={styles.fieldItem}
          value={permit.status}
          onChange={status =>
            onUpdatePermit({ ...permit, status: status as ParkingPermitStatus })
          }
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
          value={permit.description}
          onChange={e =>
            onUpdatePermit({ ...permit, description: e.target.value })
          }
        />
      </div>
    </div>
  );
};
export default PermitInfo;
