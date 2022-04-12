import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PowerType } from '../../types';

const T_PATH = 'components.common.powerTypeSelect';

interface PowerTypeOption {
  label: string;
  value: PowerType;
}

interface PowerTypeSelectProps {
  className?: string;
  label: string;
  value: PowerType;
  onChange: (value: PowerType) => void;
}

const PowerTypeSelect = ({
  label,
  value,
  className,
  onChange,
}: PowerTypeSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options = [
    {
      label: t(`${T_PATH}.electric`),
      value: PowerType.ELECTRIC,
    },
    {
      label: t(`${T_PATH}.bensin`),
      value: PowerType.BENSIN,
    },
    {
      label: t(`${T_PATH}.diesel`),
      value: PowerType.DIESEL,
    },
    {
      label: t(`${T_PATH}.bifuel`),
      value: PowerType.BIFUEL,
    },
  ];
  return (
    <Select
      className={className}
      label={label}
      options={options}
      value={{ label: t(`${T_PATH}.${value.toLocaleLowerCase()}`), value }}
      onChange={(option: PowerTypeOption) => onChange(option.value)}
    />
  );
};

export default PowerTypeSelect;
