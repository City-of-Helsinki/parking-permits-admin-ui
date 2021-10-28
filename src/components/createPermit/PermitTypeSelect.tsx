import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitType } from '../../types';

const T_PATH = 'components.createPermit.permitTypeSelect';

interface PermitTypeOption {
  label: string;
  value: PermitType;
}

interface PermitTypeSelectProps {
  className?: string;
  value: PermitType;
  onChange: (permitType: PermitType) => void;
}

const PermitTypeSelect = ({
  className,
  value,
  onChange,
}: PermitTypeSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const options: PermitTypeOption[] = [
    {
      label: t(`${T_PATH}.residentPermit`),
      value: PermitType.RESIDENT,
    },
    {
      label: t(`${T_PATH}.companyPermit`),
      value: PermitType.COMPANY,
    },
  ];
  return (
    <Select
      className={className}
      label={t(`${T_PATH}.permitType`)}
      options={options}
      value={options.find(option => option.value === value)}
      onChange={(option: PermitTypeOption) => onChange(option.value)}
    />
  );
};

export default PermitTypeSelect;
