import { Button, Checkbox, RadioButton, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrafiComVehicle } from '../../services/types';
import Divider from '../common/Divider';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.createResidentPermit.vehicleInfo';

function formatVehicleName(vehicle: TrafiComVehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

interface VehicleInfoProps {
  className?: string;
  vehicle?: TrafiComVehicle;
  searchRegNumber: string;
  onChangeSearchRegNumber: (regNumber: string) => void;
  onSearchRegistrationNumber: (regNumber: string) => void;
  onSelectUser: (userId: string) => void;
  onUpdateField: (field: keyof TrafiComVehicle, value: unknown) => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  searchRegNumber,
  onChangeSearchRegNumber,
  onSearchRegistrationNumber,
  onSelectUser,
  onUpdateField,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.vechileInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          className={styles.fieldItem}
          id="registrationNumber"
          label={t(`${T_PATH}.registrationNumber`)}
          value={searchRegNumber}
          onChange={e => onChangeSearchRegNumber(e.target.value)}>
          <Button
            onClick={() =>
              searchRegNumber && onSearchRegistrationNumber(searchRegNumber)
            }>
            {t(`${T_PATH}.search`)}
          </Button>
        </TextInput>
        {vehicle?.owner && (
          <RadioButton
            disabled
            id="vehicleOwner"
            name="vehicleUser"
            label={t(`${T_PATH}.owner`)}
            value={vehicle.owner.nationalIdNumber}
            onChange={e => onSelectUser(e.target.value)}
          />
        )}
        {vehicle?.holder && (
          <RadioButton
            disabled
            id="vehicleHolder"
            name="vehicleUser"
            label={t(`${T_PATH}.holder`)}
            value={vehicle.holder.nationalIdNumber}
            onChange={e => onSelectUser(e.target.value)}
          />
        )}
        {vehicle?.otherHolder && (
          <RadioButton
            disabled
            id="vehicleOtherHolder"
            name="vehicleUser"
            label={t(`${T_PATH}.otherHolder`)}
            value={vehicle.otherHolder.nationalIdNumber}
            onChange={e => onSelectUser(e.target.value)}
          />
        )}
        {vehicle && (
          <div className={styles.vehicleInfo}>
            <div className={styles.vehicleInfoTitle}>
              {t(`${T_PATH}.vehicleInfo`)}
            </div>
            <div className={styles.vehicleInfoContent}>
              <div className={styles.vehicleName}>
                {formatVehicleName(vehicle)}
              </div>
              <div className={styles.vehicleType}>{vehicle.type}</div>
              <div className={styles.serialNumber}>{vehicle.serialNumber}</div>
              <Checkbox
                id="isLowEmission"
                name="isLowEmission"
                label={t(`${T_PATH}.lowEmissionVehicle`)}
                checked={vehicle.isLowEmission}
                onChange={e => onUpdateField('isLowEmission', e.target.checked)}
              />
              <Checkbox
                id="consentLowEmissionDiscount"
                name="consentLowEmissionDiscount"
                label={t(`${T_PATH}.consentLowEmissionDiscountText`)}
                checked={vehicle.consentLowEmissionDiscount}
                onChange={e =>
                  onUpdateField('consentLowEmissionDiscount', e.target.checked)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VehicleInfo;
