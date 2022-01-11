import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'components.superAdmin.products.lowEmissionDiscountSelect';

interface LowEmissionDiscountOption {
  label: string;
  value: number;
}

interface LowEmissionDiscountSelectProps {
  className?: string;
  label: string;
  value?: number;
  error?: string;
  onChange: (value: number) => void;
}

const LowEmissionDiscountSelect = ({
  value,
  onChange,
  ...otherProps
}: LowEmissionDiscountSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options: LowEmissionDiscountOption[] = [
    {
      label: '50%',
      value: 0.5,
    },
    {
      label: t(`${T_PATH}.noDiscount`),
      value: 0,
    },
  ];
  const selected = options.find(option => option.value === value) || options[0];
  return (
    <Select
      {...otherProps}
      options={options}
      value={selected}
      onChange={(option: LowEmissionDiscountOption) => onChange(option.value)}
    />
  );
};

export default LowEmissionDiscountSelect;
