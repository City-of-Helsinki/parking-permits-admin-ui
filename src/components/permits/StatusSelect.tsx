import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatus, ParkingPermitStatusOrAll } from '../../types';
import StatusLabel from '../common/StatusLabel';

const T_PATH = 'components.permits.statusSelect';

interface StatusOption {
  label: React.ReactNode;
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
      label: <StatusLabel status={ParkingPermitStatus.DRAFT} />,
      value: ParkingPermitStatus.DRAFT,
    },
    {
      label: <StatusLabel status={ParkingPermitStatus.VALID} />,
      value: ParkingPermitStatus.VALID,
    },
    {
      label: <StatusLabel status={ParkingPermitStatus.PAYMENT_IN_PROGRESS} />,
      value: ParkingPermitStatus.PAYMENT_IN_PROGRESS,
    },
    {
      label: <StatusLabel status={ParkingPermitStatus.CANCELLED} />,
      value: ParkingPermitStatus.CANCELLED,
    },
    {
      label: <StatusLabel status={ParkingPermitStatus.CLOSED} />,
      value: ParkingPermitStatus.CLOSED,
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
