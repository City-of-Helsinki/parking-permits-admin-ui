import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductType } from '../../../types';
import SingleSelect, { SingleSelectOption } from '../../common/SingleSelect';

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
  const options: SingleSelectOption<ProductType>[] = [
    { label: t('productType.resident'), value: ProductType.RESIDENT },
    { label: t('productType.company'), value: ProductType.COMPANY },
  ];
  const selected = options.find(option => option.value === value) || options[0];
  return (
    <SingleSelect
      {...otherProps}
      options={options}
      value={selected.value}
      onChange={newValue => newValue && onChange(newValue)}
    />
  );
};

export default ProductTypeSelect;
