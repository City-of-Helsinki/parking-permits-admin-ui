import { Checkbox, SelectionGroup } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import filterItems from './filterItems';

const T_PATH = 'components.permits.permitsSearchFilters';

export interface PermitsSearchFilterProps {
  filters: string[];
  onChange: (filters: string[]) => void;
}

const PermitsSearchFilters = ({
  filters,
  onChange,
}: PermitsSearchFilterProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <SelectionGroup label={t(`${T_PATH}.filterList`)}>
      {filterItems.map(({ labelKey, value }) => (
        <Checkbox
          key={value}
          id={value}
          checked={filters.includes(value)}
          label={t(labelKey)}
          onChange={e => {
            const newFilters = e.target.checked
              ? [...filters, value]
              : filters.filter(item => item !== value);
            onChange(newFilters);
          }}
        />
      ))}
    </SelectionGroup>
  );
};

export default PermitsSearchFilters;
