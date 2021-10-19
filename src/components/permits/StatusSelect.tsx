import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatus, ParkingPermitStatusOrAll } from '../../types';

const T_PATH = 'components.permits.statusSelect';

interface StatusOption {
  label: string;
  value: ParkingPermitStatusOrAll;
}

interface StatusSelectProps {
  className?: string;
  value: ParkingPermitStatusOrAll;
  onChange: (value: ParkingPermitStatusOrAll) => void;
}

const StatusSelect = ({
  value,
  onChange,
  ...otherProps
}: StatusSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusOptions: StatusOption[] = [
    {
      label: t(`${T_PATH}.all`),
      value: 'ALL',
    },
    {
      label: t(`${T_PATH}.draft`),
      value: ParkingPermitStatus.DRAFT,
    },
    {
      label: t(`${T_PATH}.valid`),
      value: ParkingPermitStatus.VALID,
    },
    {
      label: t(`${T_PATH}.cancelled`),
      value: ParkingPermitStatus.CANCELLED,
    },
    {
      label: t(`${T_PATH}.expired`),
      value: ParkingPermitStatus.EXPIRED,
    },
  ];
  return (
    <Select
      {...otherProps}
      label={t(`${T_PATH}.status`)}
      options={statusOptions}
      value={statusOptions.find(option => option.value === value)}
      onChange={(option: StatusOption) => onChange(option.value)}
    />
  );
};

export default StatusSelect;
