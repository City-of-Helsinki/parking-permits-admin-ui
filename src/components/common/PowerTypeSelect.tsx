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
  disabled: boolean;
  onChange: (powerType: PowerType) => void;
}

const PowerTypeSelect = ({
  label,
  powerType,
  className,
  disabled,
  onChange,
}: PowerTypeSelectProps): React.ReactElement => {
  const { t } = useTranslation();

  const powerTypeElectric = {
    label: t(`${T_PATH}.electric`),
    name: 'Electric',
    value: '04',
  };
  const powerTypeBensin = {
    label: t(`${T_PATH}.bensin`),
    name: 'Bensin',
    value: '01',
  };
  const powerTypeDiesel = {
    label: t(`${T_PATH}.diesel`),
    name: 'Diesel',
    value: '02',
  };
  const powerTypeBifuel = {
    label: t(`${T_PATH}.bifuel`),
    name: 'Bifuel',
    value: '03',
  };

  const options = [
    powerTypeElectric,
    powerTypeBensin,
    powerTypeDiesel,
    powerTypeBifuel,
  ];

  const defaultPowerType = powerTypeBensin;
  const safePowerType = powerType ?? defaultPowerType;
  let powerTypeLabel = t(`${T_PATH}.other`);

  if (safePowerType.name) {
    powerTypeLabel = t(`${T_PATH}.${safePowerType.name?.toLowerCase()}`);
  }

  return (
    <Select
      className={className}
      label={label}
      options={options}
      value={{
        label: powerTypeLabel,
        name: safePowerType.name,
        value: safePowerType.identifier,
      }}
      disabled={disabled}
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
