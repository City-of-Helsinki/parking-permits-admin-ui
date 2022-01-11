import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductType } from '../../../types';

interface ProductTypeOption {
  label: string;
  value: ProductType;
}

interface ProductTypeSelectProps {
  className?: string;
  label: string;
  value?: ProductType;
  error?: string;
  onChange: (productType: ProductType) => void;
}

const ProductTypeSelect = ({
  value,
  onChange,
  ...otherProps
}: ProductTypeSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options: ProductTypeOption[] = [
    {
      label: t('productType.resident'),
      value: ProductType.RESIDENT,
    },
    {
      label: t('productType.company'),
      value: ProductType.COMPANY,
    },
  ];
  const selected = options.find(option => option.value === value) || options[0];
  return (
    <Select
      {...otherProps}
      options={options}
      value={selected}
      onChange={(option: ProductTypeOption) => onChange(option.value)}
    />
  );
};

export default ProductTypeSelect;
