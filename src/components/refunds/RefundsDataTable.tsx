import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Refund } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import DataTable from '../common/DataTable';
import { Column } from '../types';
import RefundStatusLabel from './RefundStatusLabel';

const T_PATH = 'components.refunds.refundsDataTable';

export interface RefundsDataTableProps {
  selection?: Refund[] | null;
  refunds: Refund[];
  pageInfo?: PageInfo;
  loading?: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (refund: Refund) => void;
  onExport?: () => void;
  onSelectionChange: (refunds: Refund[]) => void;
}

const RefundsDataTable = ({
  selection = null,
  refunds,
  pageInfo,
  loading = false,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
  onSelectionChange,
}: RefundsDataTableProps): React.ReactElement => {
  const { t } = useTranslation();
  const columns: Column<Refund>[] = [
    {
      name: t(`${T_PATH}.refundNumber`),
      field: 'id',
      selector: ({ id }) => id,
      orderFields: ['id'],
    },
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ name }) => name,
      orderFields: ['name'],
    },
    {
      name: t(`${T_PATH}.orderNumber`),
      field: 'orderId',
      selector: ({ order }) => order.id,
      orderFields: ['order_id'],
    },
    {
      name: t(`${T_PATH}.registrationNumber`),
      field: 'registrationNumber',
      selector: ({ order }) =>
        order.orderPermits
          .map(permit => permit.vehicle.registrationNumber)
          .join(', '),
      orderFields: ['order__permits__vehicle__registration_number'],
    },
    {
      name: t(`${T_PATH}.accountNumber`),
      field: 'accountNumber',
      selector: ({ iban }) => iban,
      orderFields: ['iban'],
    },
    {
      name: t(`${T_PATH}.createdAt`),
      field: 'createdAt',
      selector: ({ createdAt }) => formatDateTimeDisplay(createdAt),
      orderFields: ['created_at'],
    },
    {
      name: t(`${T_PATH}.acceptedAt`),
      field: 'acceptedAt',
      selector: ({ acceptedAt }) =>
        acceptedAt ? formatDateTimeDisplay(acceptedAt) : '-',
      orderFields: ['accepted_at'],
    },
    {
      name: t(`${T_PATH}.status`),
      field: 'status',
      selector: ({ status }) => <RefundStatusLabel status={status} />,
      orderFields: ['status'],
    },
    {
      name: t(`${T_PATH}.amount`),
      field: 'amount',
      selector: ({ amount }) => `${amount} €`,
      orderFields: ['amount'],
    },
  ];

  return (
    <DataTable
      selection={selection}
      data={refunds}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(refund: Refund) => refund.id}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
      onExport={onExport}
      onSelectionChange={onSelectionChange}
    />
  );
};

export default RefundsDataTable;
