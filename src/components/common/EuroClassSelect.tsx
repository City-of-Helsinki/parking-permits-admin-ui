import { Select } from 'hds-react';
import React from 'react';

interface EuroClassOption {
  label: string;
  value: number;
}

interface EuroClassSelectProps {
  className?: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

const EURO_CLASS_OPTIONS: EuroClassOption[] = [
  {
    label: 'Euro 1',
    value: 1,
  },
  {
    label: 'Euro 2',
    value: 2,
  },
  {
    label: 'Euro 3',
    value: 3,
  },
  {
    label: 'Euro 4',
    value: 4,
  },
  {
    label: 'Euro 5',
    value: 5,
  },
  {
    label: 'Euro 6',
    value: 6,
  },
];

const EuroClassSelect = ({
  label,
  value,
  disabled,
  className,
  onChange,
}: EuroClassSelectProps): React.ReactElement => (
  <Select
    className={className}
    label={label}
    options={EURO_CLASS_OPTIONS}
    value={{ label: `Euro ${value}`, value }}
    disabled={disabled}
    onChange={(option: EuroClassOption) => onChange(option.value)}
  />
);

export default EuroClassSelect;
