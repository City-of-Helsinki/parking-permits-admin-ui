import { Select } from 'hds-react';
import React from 'react';
import { VehicleClass } from '../../types';

interface VehicleClassOption {
  label: string;
  value: VehicleClass;
}

interface VehicleClassSelectProps {
  className?: string;
  label: string;
  value: VehicleClass;
  disabled: boolean;
  onChange: (value: VehicleClass) => void;
}

const VEHICLE_CLASS_OPTIONS: VehicleClassOption[] = Object.values(
  VehicleClass
).map(vehicleClass => ({ label: vehicleClass, value: vehicleClass }));

const VehicleClassSelect = ({
  label,
  value,
  className,
  disabled,
  onChange,
}: VehicleClassSelectProps): React.ReactElement => (
  <Select
    className={className}
    label={label}
    options={VEHICLE_CLASS_OPTIONS}
    value={{ label: value, value }}
    disabled={disabled}
    onChange={(option: VehicleClassOption) => onChange(option.value)}
  />
);

export default VehicleClassSelect;
