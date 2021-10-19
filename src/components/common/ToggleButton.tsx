import { Button } from 'hds-react';
import React from 'react';
import styles from './ToggleButton.module.scss';

export interface ToggleButtonProps<T> extends React.PropsWithChildren<unknown> {
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
      theme="black"
      variant={selected ? 'primary' : 'secondary'}
      size="small"
      onClick={handleClick}>
      {children}
    </Button>
  );
};

export default ToggleButton;
