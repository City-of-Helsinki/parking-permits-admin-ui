import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleButton from '../common/ToggleButton';
import ToggleButtonGroup from '../common/ToggleButtonGroup';
import filterItems from './filterItems';

const T_PATH = 'components.permits.permitsSearchFilters';

export interface PermitsSearchFilterProps {
  filter: string;
  onChange: (filter: string) => void;
}

const PermitsSearchFilters = ({
  filter,
  onChange,
}: PermitsSearchFilterProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <ToggleButtonGroup
      exclusive
      label={t(`${T_PATH}.filterList`)}
      value={filter}
      onChange={value => onChange(value as string)}>
      {filterItems.map(({ labelKey, value }) => (
        <ToggleButton key={value} value={value}>
          {t(labelKey)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default PermitsSearchFilters;
