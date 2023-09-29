import {
  Button,
  Checkbox,
  Notification,
  NumberInput,
  TextInput,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitPrice, Vehicle } from '../../types';
import Divider from '../common/Divider';
import EmissionTypeSelect from '../common/EmissionTypeSelect';
import EuroClassSelect from '../common/EuroClassSelect';
import PermitPriceRow from '../common/PermitPriceRow';
import PowerTypeSelect from '../common/PowerTypeSelect';
import VehicleClassSelect from '../common/VehicleClassSelect';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.residentPermit.vehicleInfo';
interface VehicleInfoProps {
  className?: string;
  vehicle: Vehicle;
  searchError?: string;
  permitPrices: PermitPrice[];
  onSearchRegistrationNumber: (regNumber: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  searchError,
  permitPrices,
  onSearchRegistrationNumber,
  onUpdateVehicle,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const {
    manufacturer,
    model,
    registrationNumber,
    consentLowEmissionAccepted,
    serialNumber,
    vehicleClass,
    euroClass,
    emission,
    emissionType,
    powerType,
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
          value={registrationNumber?.toUpperCase()}
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
          powerType={powerType}
          onChange={pType => onUpdateVehicle({ ...vehicle, powerType: pType })}
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
          value={emission || 0}
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
        {permitPrices.length > 0 && (
          <div className={styles.priceInfo}>
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
          </div>
        )}
      </div>
    </div>
  );
};
export default VehicleInfo;
