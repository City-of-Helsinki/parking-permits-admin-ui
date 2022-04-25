import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Refund } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import DataTable from '../common/DataTable';
import { Column } from '../types';

const T_PATH = 'components.refunds.refundsDataTable';

export interface RefundsDataTableProps {
  refunds: Refund[];
  pageInfo?: PageInfo;
  loading?: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (refund: Refund) => void;
  onExport?: () => void;
}

const RefundsDataTable = ({
  refunds,
  pageInfo,
  loading = false,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: RefundsDataTableProps): React.ReactElement => {
  const { t } = useTranslation();
  const columns: Column<Refund>[] = [
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ name }) => name,
      orderFields: ['name'],
    },
    {
      name: t(`${T_PATH}.amount`),
      field: 'amount',
      selector: ({ amount }) => `${amount} €`,
      orderFields: ['amount'],
    },
    {
      name: 'IBAN',
      field: 'iban',
      selector: ({ iban }) => iban,
      orderFields: ['iban'],
    },
    {
      name: t(`${T_PATH}.status`),
      field: 'status',
      selector: ({ status }) => status,
      orderFields: ['status'],
    },
    {
      name: t(`${T_PATH}.createdAt`),
      field: 'createdAt',
      selector: ({ createdAt }) => formatDateTimeDisplay(createdAt),
      orderFields: ['createdAt'],
    },
  ];

  return (
    <DataTable
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
    />
  );
};

export default RefundsDataTable;
