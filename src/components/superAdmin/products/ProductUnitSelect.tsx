import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductUnit } from '../../../types';
import SingleSelect, { SingleSelectOption } from '../../common/SingleSelect';

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
  const options: SingleSelectOption<ProductUnit>[] = [
    { label: t('productUnit.monthly'), value: ProductUnit.MONTHLY },
    { label: t('productUnit.pieces'), value: ProductUnit.PIECES },
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

export default ProductUnitSelect;
