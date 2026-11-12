import React from 'react';
import { useTranslation } from 'react-i18next';
import SingleSelect, { SingleSelectOption } from '../../common/SingleSelect';

const T_PATH = 'components.superAdmin.products.lowEmissionDiscountSelect';

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
  const options: SingleSelectOption<string>[] = [
    { label: '50%', value: '0.5' },
    { label: t(`${T_PATH}.noDiscount`), value: '0' },
  ];
  const selected =
    options.find(option => option.value === String(value)) || options[0];
  return (
    <SingleSelect
      {...otherProps}
      options={options}
      value={selected.value}
      onChange={newValue => newValue && onChange(Number(newValue))}
    />
  );
};

export default LowEmissionDiscountSelect;
