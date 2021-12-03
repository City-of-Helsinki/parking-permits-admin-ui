import { gql, useQuery } from '@apollo/client';
import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone } from '../../types';
import { formatZone } from '../../utils';

const T_PATH = 'components.common.zoneSelect';

const ZONES_QUERY = gql`
  query Query {
    zones {
      id
      name
      description
      descriptionSv
      residentPrice
    }
  }
`;

interface ZoneOption {
  label: React.ReactNode;
  value: string;
}

interface ZoneSelectProps {
  className?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange: (zone: ParkingZone | undefined) => void;
}

const ZoneSelect = ({
  value,
  onChange,
  ...otherProps
}: ZoneSelectProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const { data } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);
  const emptyOption: ZoneOption = {
    label: '--------',
    value: '',
  };
  const zoneOptions: ZoneOption[] = data?.zones
    ? [emptyOption].concat(
        data.zones.map(zone => ({
          label: formatZone(zone, i18n.language),
          value: zone.name,
        }))
      )
    : [emptyOption];
  const handleChange = (option: ZoneOption) => {
    const selectedZone = data?.zones.find(zone => option.value === zone.name);
    return onChange(selectedZone);
  };
  const selectedOption = value
    ? zoneOptions.find(option => option.value === value)
    : undefined;
  return (
    <Select
      {...otherProps}
      label={t(`${T_PATH}.zone`)}
      options={zoneOptions}
      value={selectedOption || zoneOptions[0]}
      onChange={handleChange}
    />
  );
};

export default ZoneSelect;
