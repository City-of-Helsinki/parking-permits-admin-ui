import { Button, Checkbox, IconPlus, IconTrash } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useUserRole, { UserRole } from '../../api/useUserRole';
import { ParkingPermitStatus, PermitDetail, PermitPrice } from '../../types';
import { formatVehicleName } from '../../utils';
import PermitPriceRow from '../common/PermitPriceRow';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.permitDetail.vehicleInfo';

export interface VehicleInfoProps {
  className?: string;
  permit: PermitDetail;
  permitPrices?: PermitPrice[];
  openAddTempVehicle?: (state: boolean) => void;
  removeTemporaryVehicle: (data: { variables: { permitId: string } }) => void;
}

const VehicleInfo = ({
  className,
  permit,
  permitPrices,
  openAddTempVehicle,
  removeTemporaryVehicle,
}: VehicleInfoProps): React.ReactElement => {
  const userRole = useUserRole();
  const { t } = useTranslation();
  const { vehicle, consentLowEmissionAccepted, activeTemporaryVehicle } =
    permit;
  const { isLowEmission } = vehicle;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        <div className={styles.vehicle}>
          {formatVehicleName(activeTemporaryVehicle?.vehicle || vehicle)}
        </div>
        <div className={styles.emissionInfo}>
          {t(
            `${T_PATH}.${
              isLowEmission ? 'lowEmissionVehicle' : 'highEmissionVehicle'
            }`
          )}
        </div>
        {permitPrices && permitPrices.length > 0 && (
          <div className={styles.priceList}>
            {permitPrices.map(permitPrice => (
              <PermitPriceRow
                key={permitPrice.startDate}
                className={styles.productPriceRow}
                permitPrice={permitPrice}
              />
            ))}
          </div>
        )}
        <Checkbox
          disabled
          id="consent-low-emission-discount"
          name="consent-low-emission-discount"
          label={t(`${T_PATH}.consentLowEmissionDiscountText`)}
          checked={consentLowEmissionAccepted}
        />
        <div className={styles.vehicleCopyright}>
          {t(`${T_PATH}.vehicleCopyright`)}
        </div>
      </div>

      {!activeTemporaryVehicle &&
        userRole >= UserRole.CUSTOMER_SERVICE &&
        permit.status === ParkingPermitStatus.VALID && (
          <Button
            className={styles.addTemporaryVehicle}
            variant="supplementary"
            onClick={() => openAddTempVehicle?.(true)}
            iconLeft={<IconPlus />}>
            {t(`${T_PATH}.addTemporaryVehicle`)}
          </Button>
        )}

      {activeTemporaryVehicle && (
        <>
          {userRole >= UserRole.CUSTOMER_SERVICE && (
            <Button
              className={styles.addTemporaryVehicle}
              variant="supplementary"
              onClick={() =>
                removeTemporaryVehicle({
                  variables: { permitId: `${permit.id}` },
                })
              }
              iconLeft={<IconTrash />}>
              {t(`${T_PATH}.removeTemporaryVehicle`)}
            </Button>
          )}
          <div className={styles.invalidVehicle}>
            <div className={styles.title}>{t(`${T_PATH}.invalid`)}</div>
            <div className={styles.infoBox}>
              <div className={styles.vehicle}>{formatVehicleName(vehicle)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleInfo;
