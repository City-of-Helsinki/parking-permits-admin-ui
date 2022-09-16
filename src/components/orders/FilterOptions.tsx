import { Checkbox, SelectionGroup } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type FilterOption = {
  i18n: string;
  value: string;
};

export interface FilterOptionsProps {
  state: Set<string>;
  onChange: (val: Set<string>) => void;
  label: string;
  options: FilterOption[];
}

const FilterOptions = ({
  state,
  onChange,
  label,
  options,
}: FilterOptionsProps): React.ReactElement => {
  const { t } = useTranslation();
  function handleChange(val: string, toggle: boolean) {
    const newState = new Set(state);

    if (toggle) {
      newState.add(val);
    } else {
      newState.delete(val);
    }

    onChange(newState);
  }

  const optionElements = options.map(({ i18n, value }) => (
    <Checkbox
      key={value}
      id={value}
      label={t(i18n)}
      checked={state.has(value)}
      onChange={e => handleChange(value, e.target.checked)}
    />
  ));

  return (
    <SelectionGroup direction="vertical" label={label}>
      {optionElements}
    </SelectionGroup>
  );
};

export default FilterOptions;
