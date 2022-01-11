import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductUnit } from '../../../types';

interface ProductUnitOption {
  label: string;
  value: ProductUnit;
}

interface ProductUnitSelectProps {
  className?: string;
  label: string;
  value?: ProductUnit;
  error?: string;
  onChange: (unit: ProductUnit) => void;
}

const ProductUnitSelect = ({
  value,
  onChange,
  ...otherProps
}: ProductUnitSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options: ProductUnitOption[] = [
    {
      label: t('productUnit.monthly'),
      value: ProductUnit.MONTHLY,
    },
    {
      label: t('productUnit.pieces'),
      value: ProductUnit.PIECES,
    },
  ];
  const selected = options.find(option => option.value === value) || options[0];
  return (
    <Select
      {...otherProps}
      options={options}
      value={selected}
      onChange={(option: ProductUnitOption) => onChange(option.value)}
    />
  );
};

export default ProductUnitSelect;
