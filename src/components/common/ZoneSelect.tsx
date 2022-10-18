import { gql, useQuery } from '@apollo/client';
import { Select, SingleSelectProps } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone } from '../../types';

const T_PATH = 'components.common.zoneSelect';

const ZONES_QUERY = gql`
  query GetZones {
    zones {
      name
      label
      labelSv
    }
  }
`;

interface ZoneSelectProps
  extends Omit<SingleSelectProps<ParkingZone>, 'label' | 'options' | 'value'> {
  value?: string | ParkingZone;
}

const ZoneSelect = ({
  optionLabelField,
  value,
  ...otherProps
}: ZoneSelectProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const { data } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);

  function getValue(zones: ParkingZone[]): ParkingZone | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return zones.find(zone => zone.name === value) || null;
    }
    return value;
  }

  return (
    <>
      {data?.zones && (
        <Select
          {...otherProps}
          label={t(`${T_PATH}.zone`)}
          options={data.zones}
          optionLabelField={
            optionLabelField || (i18n.language === 'sv' ? 'labelSv' : 'label')
          }
          placeholder={t(`${T_PATH}.placeholder`)}
          value={getValue(data.zones)}
        />
      )}
    </>
  );
};

export default ZoneSelect;
