import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PowerType } from '../../types';

const T_PATH = 'components.common.powerTypeSelect';

interface PowerTypeOption {
  label: string;
  value: string;
  name: string;
}

interface PowerTypeSelectProps {
  className?: string;
  label: string;
  powerType: PowerType;
  onChange: (powerType: PowerType) => void;
}

const PowerTypeSelect = ({
  label,
  powerType,
  className,
  onChange,
}: PowerTypeSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options = [
    {
      label: t(`${T_PATH}.electric`),
      name: 'Electric',
      value: '04',
    },
    {
      label: t(`${T_PATH}.bensin`),
      name: 'Bensin',
      value: '01',
    },
    {
      label: t(`${T_PATH}.diesel`),
      name: 'Diesel',
      value: '02',
    },
    {
      label: t(`${T_PATH}.bifuel`),
      name: 'Bifuel',
      value: '03',
    },
  ];
  return (
    <Select
      className={className}
      label={label}
      options={options}
      value={{
        label: t(`${T_PATH}.${powerType.name?.toLowerCase()}`),
        name: powerType.name,
        value: powerType.identifier,
      }}
      onChange={(option: PowerTypeOption) =>
        onChange({
          name: option.name,
          identifier: option.value,
        })
      }
    />
  );
};

export default PowerTypeSelect;
