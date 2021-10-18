import React from 'react';
import { ToggleButtonProps } from './ToggleButton';
import styles from './ToggleButtonGroup.module.scss';

interface ToggleButtonGroupProps<T> extends React.PropsWithChildren<unknown> {
  exclusive?: boolean;
  label: string;
  value: T | T[];
  onChange: (value: T | T[]) => void;
}

const ToggleButtonGroup = <T,>({
  exclusive = false,
  label,
  value,
  children,
  onChange,
}: ToggleButtonGroupProps<T>): React.ReactElement => {
  const handleExclusiveChange = (buttonValue: T) => {
    if (buttonValue !== value) {
      onChange(buttonValue);
    }
  };

  const handleChange = (buttonValue: T) => {
    const currentValue = value as T[];
    const newValue = currentValue.includes(buttonValue)
      ? [...currentValue, buttonValue]
      : currentValue.filter(item => item !== buttonValue);
    onChange(newValue);
  };

  return (
    <div className={styles['toggle-button-group']}>
      <div className={styles['toggle-button-group-label']}>{label}</div>
      <div className={styles['toggle-button-group-items']}>
        {React.Children.map(children, child => {
          if (!React.isValidElement<ToggleButtonProps<T>>(child)) {
            return null;
          }
          return React.cloneElement(child, {
            ...child.props,
            selected: exclusive
              ? value === child.props.value
              : (value as T[]).includes(child.props.value),
            onChange: exclusive ? handleExclusiveChange : handleChange,
          });
        })}
      </div>
    </div>
  );
};

export default ToggleButtonGroup;
