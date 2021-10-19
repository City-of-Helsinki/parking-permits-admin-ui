import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Permit } from '../../types';
import { formatDateTime, getPrimaryAddress } from '../../utils';
import DataTable from '../common/DataTable';
import { Column } from '../types';

export interface PermitsDataTableProps {
  permits: Permit[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
}

const PermitsDataTable = ({
  permits,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
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
      selector: ({ customer }) => getPrimaryAddress(customer, i18n.language),
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
      selector: row => formatDateTime(row.startTime),
      orderFields: ['start_time'],
    },
    {
      name: 'End time',
      field: 'endTime',
      selector: row => (row.endTime ? formatDateTime(row.endTime) : '-'),
      orderFields: ['end_time'],
    },
    {
      name: 'Status',
      field: 'status',
      selector: row => row.status,
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
    />
  );
};

export default PermitsDataTable;
