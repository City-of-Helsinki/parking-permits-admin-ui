import { Select } from 'hds-react';
import React from 'react';
import { EmissionType } from '../../types';

interface EmissionTypeOption {
  label: string;
  value: EmissionType;
}

interface EmissionTypeSelectProps {
  className?: string;
  label: string;
  value: EmissionType;
  disabled: boolean;
  onChange: (value: EmissionType) => void;
}

const EMISSION_TYPE_OPTIONS: EmissionTypeOption[] = Object.values(
  EmissionType
).map(emissionType => ({ label: emissionType, value: emissionType }));

const EmissionTypeSelect = ({
  label,
  value,
  disabled,
  className,
  onChange,
}: EmissionTypeSelectProps): React.ReactElement => (
  <Select
    className={className}
    label={label}
    options={EMISSION_TYPE_OPTIONS}
    value={{ label: value, value }}
    disabled={disabled}
    onChange={(option: EmissionTypeOption) => onChange(option.value)}
  />
);

export default EmissionTypeSelect;
