import { Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefundStatus, RefundStatusOrAll } from '../../types';
import RefundStatusLabel from './RefundStatusLabel';

const T_PATH = 'components.refunds.refundStatusSelect';

interface StatusOption {
  label: React.ReactNode;
  value: RefundStatusOrAll;
}

interface RefundStatusSelectProps {
  className?: string;
  value?: RefundStatusOrAll;
  onChange: (value: RefundStatusOrAll) => void;
}

const RefundStatusSelect = ({
  value = 'ALL',
  onChange,
  ...otherProps
}: RefundStatusSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusOptions: StatusOption[] = [
    {
      label: <RefundStatusLabel status="ALL" />,
      value: 'ALL',
    },
    {
      label: <RefundStatusLabel status={RefundStatus.OPEN} />,
      value: RefundStatus.OPEN,
    },
    {
      label: <RefundStatusLabel status={RefundStatus.REQUEST_FOR_APPROVAL} />,
      value: RefundStatus.REQUEST_FOR_APPROVAL,
    },
    {
      label: <RefundStatusLabel status={RefundStatus.ACCEPTED} />,
      value: RefundStatus.ACCEPTED,
    },
    {
      label: <RefundStatusLabel status={RefundStatus.REJECTED} />,
      value: RefundStatus.REJECTED,
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

export default RefundStatusSelect;
