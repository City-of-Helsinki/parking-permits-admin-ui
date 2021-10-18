import { SearchInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleButton from '../common/ToggleButton';
import ToggleButtonGroup from '../common/ToggleButtonGroup';
import { FilterItem, MatchType, SearchItem } from '../types';
import styles from './PermitsSearchInput.module.scss';

const T_PATH = 'components.permits.permitsSearchFilters';

export interface PermitsSearchInputProps {
  onChange: (searchItem: SearchItem | undefined) => void;
}

const PermitsSearchInput = ({
  onChange,
}: PermitsSearchInputProps): React.ReactElement => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [field, setField] = useState('customer');
  const filterItems: FilterItem[] = [
    {
      label: t(`${T_PATH}.customer`),
      value: 'customer',
      searchFields: ['customer__first_name', 'customer__last_name'],
      matchType: MatchType.STARTSWITH,
    },
    {
      label: t(`${T_PATH}.hetuOrBusinessId`),
      value: 'hetuOrBusinessId',
      searchFields: ['customer__national_id_number'],
      matchType: MatchType.EXACT,
    },
    {
      label: t(`${T_PATH}.registrationNumber`),
      value: 'registrationNumber',
      searchFields: ['vehicle__registration_number'],
      matchType: MatchType.EXACT,
    },
    {
      label: t(`${T_PATH}.identifier`),
      value: 'identifier',
      searchFields: ['identifier'],
      matchType: MatchType.STARTSWITH,
    },
  ];

  const doSearch = (_searchText: string, _field: string) => {
    const filterItem = filterItems.find(item => item.value === _field);
    if (!_searchText || !filterItem) {
      onChange(undefined);
      return;
    }
    const { matchType, searchFields } = filterItem;
    onChange({
      matchType,
      fields: searchFields,
      value: _searchText,
    });
  };

  const handleSearchTextChange = (newSearchText: string) => {
    setSearchText(newSearchText);
    doSearch(newSearchText, field);
  };

  const handleFieldChange = (value: string | string[]) => {
    const newField = value as string;
    setField(newField);
    doSearch(searchText, newField);
  };

  return (
    <>
      <SearchInput
        className={styles['search-input']}
        label={t(`${T_PATH}.search`)}
        onSubmit={handleSearchTextChange}
      />
      <ToggleButtonGroup
        exclusive
        label={t(`${T_PATH}.filterList`)}
        value={field}
        onChange={handleFieldChange}>
        {filterItems.map(({ label, value }) => (
          <ToggleButton key={value} value={value}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};

export default PermitsSearchInput;
