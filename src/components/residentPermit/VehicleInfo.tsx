import { Button, Checkbox, Notification, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone, PriceModifiers, Vehicle } from '../../types';
import Divider from '../common/Divider';
import ProductPriceRow from '../common/ProductPriceRow';
import VehicleCategorySelect from '../common/VehicleCategorySelect';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.residentPermit.vehicleInfo';
interface VehicleInfoProps {
  className?: string;
  vehicle: Vehicle;
  zone?: ParkingZone;
  searchError?: string;
  onSearchRegistrationNumber: (regNumber: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  zone,
  searchError,
  onSearchRegistrationNumber,
  onUpdateVehicle,
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
  const priceModifiers: PriceModifiers = {
    isLowEmission,
    isSecondaryVehicle: false,
  };
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
          onChange={e =>
            onUpdateVehicle({ ...vehicle, registrationNumber: e.target.value })
          }>
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
          onChange={e =>
            onUpdateVehicle({ ...vehicle, manufacturer: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="model"
          label={t(`${T_PATH}.model`)}
          value={model}
          onChange={e => onUpdateVehicle({ ...vehicle, model: e.target.value })}
        />
        <VehicleCategorySelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.category`)}
          value={category}
          onChange={value => onUpdateVehicle({ ...vehicle, category: value })}
        />
        <TextInput
          className={styles.fieldItem}
          id="serialNumber"
          label={t(`${T_PATH}.serialNumber`)}
          value={serialNumber}
          onChange={e =>
            onUpdateVehicle({ ...vehicle, serialNumber: e.target.value })
          }
        />
        <Checkbox
          className={styles.fieldItem}
          id="isLowEmission"
          name="isLowEmission"
          label={t(`${T_PATH}.lowEmissionVehicle`)}
          checked={isLowEmission}
          onChange={e => {
            const value = e.target.checked;
            if (value) {
              onUpdateVehicle({ ...vehicle, isLowEmission: value });
            } else {
              onUpdateVehicle({
                ...vehicle,
                isLowEmission: value,
                consentLowEmissionAccepted: false,
              });
            }
          }}
        />
        <Checkbox
          className={styles.fieldItem}
          disabled={!isLowEmission}
          id="consentLowEmissionDiscount"
          name="consentLowEmissionDiscount"
          label={t(`${T_PATH}.consentLowEmissionDiscountText`)}
          checked={consentLowEmissionAccepted}
          onChange={e =>
            onUpdateVehicle({
              ...vehicle,
              consentLowEmissionAccepted: e.target.checked,
            })
          }
        />
        <div className={styles.priceInfo}>
          <div className={styles.priceTitle}>{t(`${T_PATH}.price`)}</div>
          <div className={styles.priceList}>
            {zone?.residentProducts?.map(product => (
              <ProductPriceRow
                key={product.startDate}
                className={styles.productPriceRow}
                product={product}
                priceModifiers={priceModifiers}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VehicleInfo;
