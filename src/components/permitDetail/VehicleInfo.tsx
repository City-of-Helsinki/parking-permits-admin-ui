import { Checkbox } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail, PermitPrice } from '../../types';
import { formatVehicleName } from '../../utils';
import PermitPriceRow from '../common/PermitPriceRow';
import styles from './VehicleInfo.module.scss';

const T_PATH = 'components.permitDetail.vehicleInfo';

export interface VehicleInfoProps {
  className?: string;
  permit: PermitDetail;
  permitPrices?: PermitPrice[];
}

const VehicleInfo = ({
  className,
  permit,
  permitPrices,
}: VehicleInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const { vehicle, consentLowEmissionAccepted } = permit;
  const { isLowEmission } = vehicle;
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
      </div>
    </div>
  );
};

export default VehicleInfo;
