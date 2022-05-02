import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Permit } from '../../types';
import {
  formatAddress,
  formatCustomerName,
  formatDateTimeDisplay,
} from '../../utils';
import DataTable from '../common/DataTable';
import StatusLabel from '../common/StatusLabel';
import { Column } from '../types';

const T_PATH = 'components.permits.permitsDataTable';

export interface PermitsDataTableProps {
  permits: Permit[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (permit: Permit) => void;
  onExport?: () => void;
}

const PermitsDataTable = ({
  permits,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: PermitsDataTableProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const columns: Column<Permit>[] = [
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ customer }) => formatCustomerName(customer),
      orderFields: ['customer__first_name', 'customer__last_name'],
    },
    {
      name: 'Hetu',
      field: 'nationalIdNumber',
      selector: ({ customer }) => customer.nationalIdNumber,
      orderFields: ['customer__national_id_number'],
    },
    {
      name: t(`${T_PATH}.registrationNumber`),
      field: 'registrationNumber',
      selector: row => row.vehicle.registrationNumber,
      orderFields: ['vehicle__registration_number'],
    },
    {
      name: t(`${T_PATH}.primaryAddress`),
      field: 'primaryAddress',
      selector: ({ customer }) =>
        customer?.primaryAddress
          ? formatAddress(customer.primaryAddress, i18n.language)
          : '-',
      orderFields: [
        'customer__primary_address__street_name',
        'customer__primary_address__street_number',
      ],
    },
    {
      name: t(`${T_PATH}.otherAddress`),
      field: 'otherAddress',
      selector: ({ customer }) =>
        customer?.otherAddress
          ? formatAddress(customer.otherAddress, i18n.language)
          : '-',
      orderFields: [
        'customer__other_address__street_name',
        'customer__other_address__street_number',
      ],
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'parkingZone',
      selector: row => row.parkingZone.name,
      orderFields: ['parking_zone__name'],
    },
    {
      name: t(`${T_PATH}.startTime`),
      field: 'startTime',
      selector: row => formatDateTimeDisplay(row.startTime),
      orderFields: ['start_time'],
    },
    {
      name: t(`${T_PATH}.endTime`),
      field: 'endTime',
      selector: row => (row.endTime ? formatDateTimeDisplay(row.endTime) : '-'),
      orderFields: ['end_time'],
    },
    {
      name: t(`${T_PATH}.status`),
      field: 'status',
      selector: row => <StatusLabel status={row.status} />,
      orderFields: ['status'],
    },
  ];

  return (
    <DataTable
      data={permits}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(row: Permit) => row.id}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
      onExport={onExport}
    />
  );
};

export default PermitsDataTable;
