import { Button, Checkbox, Notification, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone, Vehicle } from '../../types';
import { formatMonthlyPrice } from '../../utils';
import Divider from '../common/Divider';
import VehicleCategorySelect from '../common/VehicleCategorySelect';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.createResidentPermit.vehicleInfo';
interface VehicleInfoProps {
  className?: string;
  vehicle: Vehicle;
  zone?: ParkingZone;
  searchError?: string;
  onSearchRegistrationNumber: (regNumber: string) => void;
  onUpdateField: (field: keyof Vehicle, value: unknown) => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  zone,
  searchError,
  onSearchRegistrationNumber,
  onUpdateField,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const {
    manufacturer,
    model,
    registrationNumber,
    isLowEmission,
    consentLowEmissionAccepted,
    serialNumber,
    category,
  } = vehicle;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.vehicleInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          className={styles.fieldItem}
          id="registrationNumber"
          label={t(`${T_PATH}.registrationNumber`)}
          value={registrationNumber}
          onChange={e => onUpdateField('registrationNumber', e.target.value)}>
          <Button
            onClick={() =>
              registrationNumber &&
              onSearchRegistrationNumber(registrationNumber)
            }>
            {t(`${T_PATH}.search`)}
          </Button>
        </TextInput>
        {searchError && <Notification type="error">{searchError}</Notification>}
        <TextInput
          className={styles.fieldItem}
          id="manufacturer"
          label={t(`${T_PATH}.manufacturer`)}
          value={manufacturer}
          onChange={e => onUpdateField('manufacturer', e.target.value)}
        />
        <TextInput
          className={styles.fieldItem}
          id="model"
          label={t(`${T_PATH}.model`)}
          value={model}
          onChange={e => onUpdateField('model', e.target.value)}
        />
        <VehicleCategorySelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.category`)}
          value={category}
          onChange={value => onUpdateField('category', value)}
        />
        <TextInput
          className={styles.fieldItem}
          id="serialNumber"
          label={t(`${T_PATH}.serialNumber`)}
          value={serialNumber}
          onChange={e => onUpdateField('serialNumber', e.target.value)}
        />
        <Checkbox
          className={styles.fieldItem}
          id="isLowEmission"
          name="isLowEmission"
          label={t(`${T_PATH}.lowEmissionVehicle`)}
          checked={isLowEmission}
          onChange={e => onUpdateField('isLowEmission', e.target.checked)}
        />
        <Checkbox
          className={styles.fieldItem}
          id="consentLowEmissionDiscount"
          name="consentLowEmissionDiscount"
          label={t(`${T_PATH}.consentLowEmissionDiscountText`)}
          checked={consentLowEmissionAccepted}
          onChange={e =>
            onUpdateField('consentLowEmissionAccepted', e.target.checked)
          }
        />
        <div className={styles.priceInfo}>
          <div className={styles.priceTitle}>{t(`${T_PATH}.price`)}</div>
          <div className={styles.priceDetail}>
            {zone && vehicle.isLowEmission && (
              <div className={styles.discountPrice}>
                {zone ? formatMonthlyPrice(zone.residentPrice / 2) : '-'}
              </div>
            )}
            <div className={styles.originalPrice}>
              {isLowEmission ? (
                <del>{zone ? formatMonthlyPrice(zone.residentPrice) : '-'}</del>
              ) : (
                <span>
                  {zone ? formatMonthlyPrice(zone.residentPrice) : '-'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VehicleInfo;
