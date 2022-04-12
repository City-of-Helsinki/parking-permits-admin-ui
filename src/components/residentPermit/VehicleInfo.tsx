import {
  Button,
  Checkbox,
  Notification,
  NumberInput,
  TextInput,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone, PriceModifiers, Vehicle } from '../../types';
import Divider from '../common/Divider';
import EmissionTypeSelect from '../common/EmissionTypeSelect';
import EuroClassSelect from '../common/EuroClassSelect';
import PowerTypeSelect from '../common/PowerTypeSelect';
import ProductPriceRow from '../common/ProductPriceRow';
import VehicleClassSelect from '../common/VehicleClassSelect';
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
    vehicleClass,
    euroClass,
    emission,
    emissionType,
    powerType,
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
        <VehicleClassSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.vehicleClass`)}
          value={vehicleClass}
          onChange={value =>
            onUpdateVehicle({ ...vehicle, vehicleClass: value })
          }
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
        <EuroClassSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.euroClass`)}
          value={euroClass}
          onChange={value => onUpdateVehicle({ ...vehicle, euroClass: value })}
        />
        <PowerTypeSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.powerType`)}
          value={powerType}
          onChange={value => onUpdateVehicle({ ...vehicle, powerType: value })}
        />
        <EmissionTypeSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.emissionType`)}
          value={emissionType}
          onChange={value =>
            onUpdateVehicle({ ...vehicle, emissionType: value })
          }
        />
        <NumberInput
          id="emission"
          className={styles.fieldItem}
          label={t(`${T_PATH}.emission`)}
          value={emission}
          min={0}
          step={1}
          onChange={e =>
            onUpdateVehicle({
              ...vehicle,
              emission: parseInt(e.target.value, 10),
            })
          }
        />
        <Divider />
        <Checkbox
          className={styles.fieldItem}
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
