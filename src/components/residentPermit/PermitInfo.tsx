import { addDays, addMonths, endOfDay } from 'date-fns';
import {
  Checkbox,
  DateInput,
  NumberInput,
  TextArea,
  TextInput,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Language,
  ParkingPermitStatus,
  PermitDetail,
  PermitPrice,
} from '../../types';
import {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatPermitMaxValidPeriodInMonths,
  formatPermitOrder,
} from '../../utils';
import Divider from '../common/Divider';
import PermitPriceRow from '../common/PermitPriceRow';
import StatusSelect from '../permits/StatusSelect';
import styles from './PermitInfo.module.scss';

const T_PATH = 'components.residentPermit.permitInfo';

interface PermitInfoProps {
  className?: string;
  editMode?: boolean;
  permit: PermitDetail;
  permitPrices: PermitPrice[];
  minStartDate?: Date;
  onUpdatePermit: (permit: PermitDetail) => void;
}

const PermitInfo = ({
  className,
  editMode = false,
  permit,
  permitPrices,
  minStartDate,
  onUpdatePermit,
}: PermitInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const expirationDate =
    permit.endTime ||
    endOfDay(
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
          id="order"
          label={t(`${T_PATH}.permitOrder`)}
          value={formatPermitOrder(
            permit,
            t(`${T_PATH}.firstPermit`),
            t(`${T_PATH}.secondPermit`)
          )}
        />
        <Checkbox
          className={styles.fieldItem}
          id="bypassTraficomValidation"
          name="bypassTraficomValidation"
          label={t(`${T_PATH}.bypassTraficomValidationText`)}
          checked={permit.bypassTraficomValidation}
          onChange={e =>
            onUpdatePermit({
              ...permit,
              bypassTraficomValidation: e.target.checked,
            })
          }
        />
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
          max={formatPermitMaxValidPeriodInMonths(permit, editMode)}
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
          minDate={minStartDate}
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
          showAllOption={false}
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
        {permitPrices.length > 0 && (
          <div className={styles.priceInfo}>
            <Divider className={styles.fieldDivider} />
            <div className={styles.priceTitle}>{t(`${T_PATH}.price`)}</div>
            <div className={styles.priceList}>
              {permitPrices.map(permitPrice => (
                <PermitPriceRow
                  key={permitPrice.startDate}
                  className={styles.productPriceRow}
                  permitPrice={permitPrice}
                />
              ))}
            </div>
            <div className={styles.priceLegend}>
              {t(`${T_PATH}.priceLegend`)}
            </div>
          </div>
        )}
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
