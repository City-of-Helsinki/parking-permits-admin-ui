import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatus, ParkingPermitStatusOrAll } from '../../types';
import SingleSelect, { SingleSelectOption } from '../common/SingleSelect';

const T_PATH = 'components.permits.statusSelect';

interface StatusSelectProps {
  className?: string;
  value: ParkingPermitStatusOrAll;
  onChange: (value: ParkingPermitStatusOrAll) => void;
  showAllOption?: boolean;
}

const StatusSelect = ({
  className,
  value,
  onChange,
  showAllOption = true,
}: StatusSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusOptions: SingleSelectOption<ParkingPermitStatusOrAll>[] = [
    { label: t('permitStatus.draft'), value: ParkingPermitStatus.DRAFT },
    {
      label: t('permitStatus.preliminary'),
      value: ParkingPermitStatus.PRELIMINARY,
    },
    { label: t('permitStatus.valid'), value: ParkingPermitStatus.VALID },
    {
      label: t('permitStatus.paymentInProgress'),
      value: ParkingPermitStatus.PAYMENT_IN_PROGRESS,
    },
    {
      label: t('permitStatus.cancelled'),
      value: ParkingPermitStatus.CANCELLED,
    },
    { label: t('permitStatus.closed'), value: ParkingPermitStatus.CLOSED },
  ];
  if (showAllOption) {
    statusOptions.unshift({ label: t(`${T_PATH}.all`), value: 'ALL' });
  }
  return (
    <SingleSelect
      className={className}
      label={t(`${T_PATH}.status`)}
      options={statusOptions}
      value={value}
      onChange={selected => selected && onChange(selected)}
    />
  );
};

export default StatusSelect;
