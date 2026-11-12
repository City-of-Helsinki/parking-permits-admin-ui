import React from 'react';
import { useTranslation } from 'react-i18next';
import { PermitType } from '../../types';
import SingleSelect, { SingleSelectOption } from '../common/SingleSelect';

const T_PATH = 'components.createPermit.permitTypeSelect';

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
  const options: SingleSelectOption<PermitType>[] = [
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
    <SingleSelect
      className={className}
      label={t(`${T_PATH}.permitType`)}
      options={options}
      value={value}
      onChange={selected => selected && onChange(selected)}
    />
  );
};

export default PermitTypeSelect;
