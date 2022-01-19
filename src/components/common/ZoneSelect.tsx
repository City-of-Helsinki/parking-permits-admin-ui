import { gql, useQuery } from '@apollo/client';
import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingZone } from '../../types';

const ZONES_QUERY = gql`
  query Query {
    zones {
      name
      label
      labelSv
      residentProducts {
        unitPrice
        startDate
        endDate
        vat
        lowEmissionDiscount
        secondaryVehicleIncreaseRate
      }
    }
  }
`;

interface ZoneOption {
  label: React.ReactNode;
  value: string;
}

interface ZoneSelectProps {
  className?: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  error?: string;
  onChange: (zone: ParkingZone | undefined) => void;
}

const ZoneSelect = ({
  value,
  onChange,
  ...otherProps
}: ZoneSelectProps): React.ReactElement => {
  const { i18n } = useTranslation();
  const { data } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);
  const emptyOption: ZoneOption = {
    label: '--------',
    value: '',
  };
  const zoneOptions: ZoneOption[] = data?.zones
    ? [emptyOption].concat(
        data.zones.map(zone => ({
          label: i18n.language === 'sv' ? zone.labelSv : zone.label,
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
      options={zoneOptions}
      value={selectedOption || zoneOptions[0]}
      onChange={handleChange}
    />
  );
};

export default ZoneSelect;
