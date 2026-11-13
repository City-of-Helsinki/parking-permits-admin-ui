import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone } from '../../types';
import SingleSelect from './SingleSelect';

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

interface ZoneSelectProps {
  id?: string;
  className?: string;
  label?: string;
  value?: string | ParkingZone;
  onChange: (zone: ParkingZone | undefined) => void;
  optionLabelField?: keyof ParkingZone;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
}

const ZoneSelect = ({
  label,
  value,
  onChange,
  optionLabelField,
  ...otherProps
}: ZoneSelectProps): React.ReactElement | null => {
  const { t, i18n } = useTranslation();
  const { data } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);

  if (!data?.zones) {
    return null;
  }
  const { zones } = data;
  const labelField =
    optionLabelField || (i18n.language === 'sv' ? 'labelSv' : 'label');

  return (
    <SingleSelect
      {...otherProps}
      label={label || t(`${T_PATH}.zone`)}
      placeholder={t(`${T_PATH}.placeholder`)}
      options={zones.map(zone => ({
        label: zone[labelField],
        value: zone.name,
      }))}
      value={typeof value === 'string' ? value : value?.name}
      onChange={name => onChange(zones.find(zone => zone.name === name))}
    />
  );
};

export default ZoneSelect;
