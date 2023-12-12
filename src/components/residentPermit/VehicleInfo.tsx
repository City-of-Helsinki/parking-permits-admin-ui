import {
  Button,
  Checkbox,
  IconTrash,
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

type Restrictions = {
  [key: string]: string;
};

const RESTRICTIONS: Restrictions = {
  '03': 'driving_ban',
  '07': 'compulsory_inspection_neglected',
  '10': 'periodic_inspection_rejected',
  '11': 'vehicle_stolen',
  '20': 'vehicle_deregistered',
  '22': 'vehicle_tax_due',
  '23': 'vehicle_prohibited_to_use_additional_tax',
  '24': 'old_vehicle_diesel_due',
  '25': 'registration_plates_confiscated',
  '34': 'driving_ban_registration_plates_confiscated',
};

interface VehicleInfoProps {
  className?: string;
  vehicle: Vehicle;
  searchError?: string;
  permitPrices: PermitPrice[];
  disableVehicleFields: boolean;
  onSearchRegistrationNumber: (regNumber: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onClearVehicle: () => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  searchError,
  permitPrices,
  disableVehicleFields,
  onSearchRegistrationNumber,
  onUpdateVehicle,
  onClearVehicle,
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
    restrictions,
  } = vehicle;

  const availableRestrictions = (restrictions ?? [])
    .map((code: string) => {
      const translation = RESTRICTIONS[code] ?? null;
      return translation ? t(`${T_PATH}.restrictions.${translation}`) : '';
    })
    .filter(Boolean);

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
        <Button
          variant="supplementary"
          onClick={onClearVehicle}
          size="small"
          iconLeft={<IconTrash size="s" />}>
          {t(`${T_PATH}.clear`)}
        </Button>
        {availableRestrictions.map(restriction => (
          <Notification type="info" key={restriction}>
            <div>{t(`${T_PATH}.restrictions.text`, { restriction })}</div>
            <div>{t(`${T_PATH}.vehicleCopyright`)}</div>
          </Notification>
        ))}
        {searchError && (
          <Notification type="error" style={{ whiteSpace: 'pre-wrap' }}>
            {searchError}
          </Notification>
        )}
        <TextInput
          className={styles.fieldItem}
          id="manufacturer"
          label={t(`${T_PATH}.manufacturer`)}
          value={manufacturer}
          disabled={!!disableVehicleFields}
          onChange={e =>
            onUpdateVehicle({ ...vehicle, manufacturer: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="model"
          label={t(`${T_PATH}.model`)}
          value={model}
          disabled={!!disableVehicleFields}
          onChange={e => onUpdateVehicle({ ...vehicle, model: e.target.value })}
        />
        <VehicleClassSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.vehicleClass`)}
          value={vehicleClass}
          disabled={!!disableVehicleFields}
          onChange={value =>
            onUpdateVehicle({ ...vehicle, vehicleClass: value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="serialNumber"
          label={t(`${T_PATH}.serialNumber`)}
          value={serialNumber}
          disabled={!!disableVehicleFields}
          onChange={e =>
            onUpdateVehicle({ ...vehicle, serialNumber: e.target.value })
          }
        />
        <EuroClassSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.euroClass`)}
          value={euroClass}
          disabled={!!disableVehicleFields}
          onChange={value => onUpdateVehicle({ ...vehicle, euroClass: value })}
        />
        <PowerTypeSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.powerType`)}
          powerType={powerType}
          disabled={!!disableVehicleFields}
          onChange={pType => onUpdateVehicle({ ...vehicle, powerType: pType })}
        />
        <EmissionTypeSelect
          className={styles.fieldItem}
          label={t(`${T_PATH}.emissionType`)}
          value={emissionType}
          disabled={!!disableVehicleFields}
          onChange={value =>
            onUpdateVehicle({ ...vehicle, emissionType: value })
          }
        />
        <NumberInput
          id="emission"
          className={styles.fieldItem}
          label={t(`${T_PATH}.emission`)}
          value={emission || 0}
          disabled={!!disableVehicleFields}
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
        <div className={styles.vehicleCopyright}>
          {t(`${T_PATH}.vehicleCopyright`)}
        </div>
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
