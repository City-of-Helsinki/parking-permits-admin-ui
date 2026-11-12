import {
  Button,
  ButtonPresetTheme,
  ButtonSize,
  ButtonVariant,
} from 'hds-react';
import React from 'react';
import styles from './ToggleButton.module.scss';

export interface ToggleButtonProps<T> {
  children: string;
  value: T;
  selected?: boolean;
  onChange?: (value: T) => void;
}

const ToggleButton = <T,>({
  value,
  selected = false,
  children,
  onChange,
}: ToggleButtonProps<T>): React.ReactElement => {
  const handleClick = () => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Button
      className={styles['toggle-button']}
      theme={ButtonPresetTheme.Black}
      variant={selected ? ButtonVariant.Primary : ButtonVariant.Secondary}
      size={ButtonSize.Small}
      onClick={handleClick}>
      {children}
    </Button>
  );
};

export default ToggleButton;
