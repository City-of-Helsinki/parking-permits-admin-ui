import classNames from 'classnames';
import React from 'react';
import { VehicleClass } from '../../types';
import SingleSelect, { SingleSelectOption } from './SingleSelect';
import styles from './VehicleClassSelect.module.scss';

interface VehicleClassSelectProps {
  className?: string;
  label: string;
  value: VehicleClass;
  disabled: boolean;
  onChange: (value: VehicleClass) => void;
}

const VEHICLE_CLASS_OPTIONS: SingleSelectOption<VehicleClass>[] = Object.values(
  VehicleClass
).map(vehicleClass => ({
  label: vehicleClass,
  value: vehicleClass,
}));

const VehicleClassSelect = ({
  label,
  value,
  className,
  disabled,
  onChange,
}: VehicleClassSelectProps): React.ReactElement => (
  <SingleSelect
    className={classNames(className, disabled && styles.disabled)}
    label={label}
    options={VEHICLE_CLASS_OPTIONS}
    value={value}
    disabled={disabled}
    onChange={selected => selected && onChange(selected)}
  />
);

export default VehicleClassSelect;
