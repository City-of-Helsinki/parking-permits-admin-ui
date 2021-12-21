import { Checkbox } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitDetail, PriceModifiers } from '../../types';
import { formatVehicleName } from '../../utils';
import ProductPriceRow from '../common/ProductPriceRow';
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
  const priceModifiers: PriceModifiers = {
    isLowEmission,
    isSecondaryVehicle: false,
  };
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
        <div className={styles.priceList}>
          {parkingZone.residentProducts?.map(product => (
            <ProductPriceRow
              key={product.startDate}
              className={styles.productPriceRow}
              product={product}
              priceModifiers={priceModifiers}
            />
          ))}
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
