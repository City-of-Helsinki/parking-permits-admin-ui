import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PowerType } from '../../types';
import styles from './PowerTypeSelect.module.scss';
import SingleSelect from './SingleSelect';

const T_PATH = 'components.common.powerTypeSelect';

const POWER_TYPES: PowerType[] = [
  { name: 'Electric', identifier: '04' },
  { name: 'Bensin', identifier: '01' },
  { name: 'Diesel', identifier: '02' },
  { name: 'Bifuel', identifier: '03' },
];
const DEFAULT_POWER_TYPE = POWER_TYPES[1];

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
  const safePowerType = powerType ?? DEFAULT_POWER_TYPE;
  const powerTypes = POWER_TYPES.some(
    ({ identifier }) => identifier === safePowerType.identifier
  )
    ? POWER_TYPES
    : [...POWER_TYPES, safePowerType];
  const getLabel = ({ name }: PowerType) =>
    name ? t(`${T_PATH}.${name.toLowerCase()}`) : t(`${T_PATH}.other`);

  return (
    <SingleSelect
      className={classNames(className, disabled && styles.disabled)}
      label={label}
      options={powerTypes.map(pType => ({
        label: getLabel(pType),
        value: pType.identifier,
      }))}
      value={safePowerType.identifier}
      disabled={disabled}
      onChange={identifier => {
        const selected = powerTypes.find(
          pType => pType.identifier === identifier
        );
        if (selected) {
          onChange(selected);
        }
      }}
    />
  );
};

export default PowerTypeSelect;
