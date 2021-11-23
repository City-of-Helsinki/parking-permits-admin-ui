import { Button, Checkbox, RadioButton, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone, ResidentPermitVehicle, VehicleUser } from '../../types';
import { formatMonthlyPrice } from '../../utils';
import Divider from '../common/Divider';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.createResidentPermit.vehicleInfo';

function formatVehicleName(vehicle: ResidentPermitVehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

function formatUserName(user: VehicleUser): string {
  const { firstName, lastName, nationalIdNumber } = user;
  return `${firstName} ${lastName}, ${nationalIdNumber}`;
}

interface VehicleInfoProps {
  className?: string;
  vehicle?: ResidentPermitVehicle;
  searchRegNumber: string;
  selectedVehicleUser: string;
  zone?: ParkingZone;
  onChangeSearchRegNumber: (regNumber: string) => void;
  onSearchRegistrationNumber: (regNumber: string) => void;
  onSelectUser: (userId: string) => void;
  onUpdateField: (field: keyof ResidentPermitVehicle, value: unknown) => void;
}

const VehicleInfo = ({
  className,
  vehicle,
  searchRegNumber,
  selectedVehicleUser,
  zone,
  onChangeSearchRegNumber,
  onSearchRegistrationNumber,
  onSelectUser,
  onUpdateField,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.vehicleInfo`)}</div>
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
          <>
            <RadioButton
              className={styles.fieldItem}
              id="vehicleOwner"
              name="vehicleUser"
              label={t(`${T_PATH}.owner`)}
              value={vehicle.owner.nationalIdNumber}
              checked={vehicle.owner.nationalIdNumber === selectedVehicleUser}
              onChange={e => onSelectUser(e.target.value)}
            />
            <div className={styles.vehicleUser}>
              {formatUserName(vehicle.owner)}
            </div>
          </>
        )}
        {vehicle?.holder && (
          <>
            <RadioButton
              className={styles.fieldItem}
              id="vehicleHolder"
              name="vehicleUser"
              label={t(`${T_PATH}.holder`)}
              value={vehicle.holder.nationalIdNumber}
              checked={vehicle.holder.nationalIdNumber === selectedVehicleUser}
              onChange={e => onSelectUser(e.target.value)}
            />
            <div className={styles.vehicleUser}>
              {formatUserName(vehicle.holder)}
            </div>
          </>
        )}
        {vehicle?.otherHolder && (
          <>
            <RadioButton
              className={styles.fieldItem}
              id="vehicleOtherHolder"
              name="vehicleUser"
              label={t(`${T_PATH}.otherHolder`)}
              value={vehicle.otherHolder.nationalIdNumber}
              checked={
                vehicle.otherHolder.nationalIdNumber === selectedVehicleUser
              }
              onChange={e => onSelectUser(e.target.value)}
            />
            <div className={styles.vehicleUser}>
              {formatUserName(vehicle.holder)}
            </div>
          </>
        )}
        {vehicle && (
          <div className={styles.vehicleInfo}>
            <div className={styles.vehicleInfoTitle}>
              {t(`${T_PATH}.vehicleInfo`)}
            </div>
            <div className={styles.vehicleInfoContent}>
              <div className={styles.basicInfoAndPriceInfo}>
                <div className={styles.basicInfo}>
                  <div className={styles.vehicleName}>
                    {formatVehicleName(vehicle)}
                  </div>
                  <div className={styles.vehicleType}>{vehicle.type}</div>
                  <div className={styles.serialNumber}>
                    {t(`${T_PATH}.serialNumber`)} {vehicle.serialNumber}
                  </div>
                </div>
                <div className={styles.priceInfo}>
                  {vehicle.isLowEmission && (
                    <div className={styles.discountPrice}>
                      {zone ? formatMonthlyPrice(zone.residentPrice / 2) : '-'}
                    </div>
                  )}
                  <div className={styles.originalPrice}>
                    {vehicle.isLowEmission ? (
                      <del>
                        {zone ? formatMonthlyPrice(zone.residentPrice) : '-'}
                      </del>
                    ) : (
                      <span>
                        {zone ? formatMonthlyPrice(zone.residentPrice) : '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
                checked={vehicle.consentLowEmissionAccepted}
                onChange={e =>
                  onUpdateField('consentLowEmissionAccepted', e.target.checked)
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
