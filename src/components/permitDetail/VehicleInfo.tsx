import { Checkbox } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail } from '../../types';
import { formatMonthlyPrice, formatVehicleName } from '../../utils';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.permitDetail.vehicleInfo';

export interface VehicleInfoProps {
  className?: string;
  permit: PermitDetail;
}

const VehicleInfo = ({
  className,
  permit,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const { vehicle, parkingZone, consentLowEmissionAccepted } = permit;
  const { isLowEmission } = vehicle;
  const { residentPrice } = parkingZone;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.infoBox}>
        <div className={styles.vechile}>{formatVehicleName(vehicle)}</div>
        <div className={styles.emissionInfo}>
          {t(
            `${T_PATH}.${
              isLowEmission ? 'lowEmissionVehicle' : 'highEmissionVehicle'
            }`
          )}
        </div>
        <div className={styles.priceInfo}>
          {isLowEmission && (
            <span>
              <strong>{formatMonthlyPrice(residentPrice / 2)}</strong>
            </span>
          )}
          <span
            style={{
              textDecoration: isLowEmission ? 'line-trhough' : 'none',
            }}>
            {formatMonthlyPrice(residentPrice)}
          </span>
        </div>
        <Checkbox
          disabled
          id="consent-low-emission-discount"
          name="consent-low-emission-discount"
          label={t(`${T_PATH}.consentLowEmissionDiscountText`)}
          checked={consentLowEmissionAccepted}
        />
      </div>
    </div>
  );
};

export default VehicleInfo;
