import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Permit } from '../../types';
import { formatAddress, formatDateTimeDisplay } from '../../utils';
import DataTable from '../common/DataTable';
import StatusLabel from '../common/StatusLabel';
import { Column } from '../types';

export interface PermitsDataTableProps {
  permits: Permit[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (permit: Permit) => void;
}

const PermitsDataTable = ({
  permits,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
}: PermitsDataTableProps): React.ReactElement => {
  const { i18n } = useTranslation();
  const columns: Column<Permit>[] = [
    {
      name: 'Name',
      field: 'name',
      selector: ({ customer }) => `${customer.firstName} ${customer.lastName}`,
      orderFields: ['customer__first_name', 'customer__last_name'],
    },
    {
      name: 'Hetu',
      field: 'nationalIdNumber',
      selector: ({ customer }) => customer.nationalIdNumber,
      orderFields: ['customer__national_id_number'],
    },
    {
      name: 'Registration number',
      field: 'registrationNumber',
      selector: row => row.vehicle.registrationNumber,
      orderFields: ['vehicle__registration_number'],
    },
    {
      name: 'Address',
      field: 'address',
      selector: ({ customer }) =>
        formatAddress(customer.primaryAddress, i18n.language),
      orderFields: [
        'customer__primary_address__street_name',
        'customer__primary_address__street_number',
      ],
    },
    {
      name: 'Zone',
      field: 'parkingZone',
      selector: row => row.parkingZone.name,
      orderFields: ['parking_zone__name'],
    },
    {
      name: 'Start time',
      field: 'startTime',
      selector: row => formatDateTimeDisplay(row.startTime),
      orderFields: ['start_time'],
    },
    {
      name: 'End time',
      field: 'endTime',
      selector: row => (row.endTime ? formatDateTimeDisplay(row.endTime) : '-'),
      orderFields: ['end_time'],
    },
    {
      name: 'Status',
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
      rowIdSelector={(row: Permit) => row.identifier}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
    />
  );
};

export default PermitsDataTable;
