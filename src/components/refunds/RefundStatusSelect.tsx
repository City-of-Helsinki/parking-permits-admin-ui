import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefundStatus, RefundStatusOrAll } from '../../types';
import SingleSelect, { SingleSelectOption } from '../common/SingleSelect';

const T_PATH = 'components.refunds.refundStatusSelect';

interface RefundStatusSelectProps {
  className?: string;
  value?: RefundStatusOrAll;
  onChange: (value: RefundStatusOrAll) => void;
}

const RefundStatusSelect = ({
  className,
  value = 'ALL',
  onChange,
}: RefundStatusSelectProps): React.ReactElement => {
  const { t } = useTranslation();
  const statusOptions: SingleSelectOption<RefundStatusOrAll>[] = [
    { label: t('refundStatus.all'), value: 'ALL' },
    { label: t('refundStatus.open'), value: RefundStatus.OPEN },
    {
      label: t('refundStatus.requestForApproval'),
      value: RefundStatus.REQUEST_FOR_APPROVAL,
    },
    { label: t('refundStatus.accepted'), value: RefundStatus.ACCEPTED },
    { label: t('refundStatus.rejected'), value: RefundStatus.REJECTED },
  ];
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

export default RefundStatusSelect;
