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
      sortable: true,
    },
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ name }) => name,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.orderNumber`),
      field: 'orderId',
      selector: ({ order }) => order.id,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.registrationNumber`),
      field: 'registrationNumber',
      selector: ({ order }) =>
        order.orderPermits
          .map(permit => permit.vehicle.registrationNumber)
          .join(', '),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.accountNumber`),
      field: 'accountNumber',
      selector: ({ iban }) => iban,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.createdAt`),
      field: 'createdAt',
      selector: ({ createdAt }) => formatDateTimeDisplay(createdAt),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.acceptedAt`),
      field: 'acceptedAt',
      selector: ({ acceptedAt }) =>
        acceptedAt ? formatDateTimeDisplay(acceptedAt) : '-',
      sortable: true,
    },
    {
      name: t(`${T_PATH}.status`),
      field: 'status',
      selector: ({ status }) => <RefundStatusLabel status={status} />,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.amount`),
      field: 'amount',
      selector: ({ amount }) => `${amount} €`,
      sortable: true,
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
