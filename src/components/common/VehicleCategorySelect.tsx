import { Select } from 'hds-react';
import React from 'react';

interface CategoryOption {
  label: string;
  value: string;
}

interface VehicleCategorySelectProps {
  className?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const VEHICLE_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    label: 'M1',
    value: 'M1',
  },
  {
    label: 'M2',
    value: 'M2',
  },
  {
    label: 'N1',
    value: 'N1',
  },
  {
    label: 'N2',
    value: 'N2',
  },
  {
    label: 'L3e',
    value: 'L3e',
  },
  {
    label: 'L4e',
    value: 'L4e',
  },
  {
    label: 'L5e',
    value: 'L5e',
  },
];

const VehicleCategorySelect = ({
  label,
  value,
  className,
  onChange,
}: VehicleCategorySelectProps): React.ReactElement => (
  <Select
    className={className}
    label={label}
    options={VEHICLE_CATEGORY_OPTIONS}
    value={VEHICLE_CATEGORY_OPTIONS.find(option => option.value === value)}
    onChange={(option: CategoryOption) => onChange(option.value)}
  />
);

export default VehicleCategorySelect;
