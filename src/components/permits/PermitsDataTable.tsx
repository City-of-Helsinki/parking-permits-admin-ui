import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageInfo, Permit } from '../../types';
import { formatDateTime, getPrimaryAddress } from '../../utils';
import DataTable from '../common/DataTable';
import { Column, OrderDirection } from '../types';

export interface PermitsDataTableProps {
  permits: Permit[];
  pageInfo?: PageInfo;
  loading: boolean;
  onPage?: (page: number) => void;
  onOrderBy: (field: string, orderDirection: OrderDirection) => void;
}

const PermitsDataTable = ({
  permits,
  pageInfo,
  loading,
  onPage,
  onOrderBy,
}: PermitsDataTableProps): React.ReactElement => {
  const { i18n } = useTranslation();
  const columns: Column<Permit>[] = [
    {
      name: 'Name',
      field: 'name',
      selector: ({ customer }) => `${customer.firstName} ${customer.lastName}`,
      sortable: true,
    },
    {
      name: 'Hetu',
      field: 'nationalIdNumber',
      selector: ({ customer }) => customer.nationalIdNumber,
      sortable: true,
    },
    {
      name: 'Registration number',
      field: 'registrationNumber',
      selector: row => row.vehicle.registrationNumber,
      sortable: true,
    },
    {
      name: 'Address',
      field: 'address',
      selector: ({ customer }) => getPrimaryAddress(customer, i18n.language),
      sortable: true,
    },
    {
      name: 'Zone',
      field: 'parkingZone',
      selector: row => row.parkingZone.name,
      sortable: true,
    },
    {
      name: 'Start time',
      field: 'startTime',
      selector: row => formatDateTime(row.startTime),
      sortable: true,
    },
    {
      name: 'End time',
      field: 'endTime',
      selector: row => (row.endTime ? formatDateTime(row.endTime) : '-'),
      sortable: true,
    },
    {
      name: 'Status',
      field: 'status',
      selector: row => row.status,
      sortable: true,
    },
  ];

  return (
    <>
      <DataTable
        data={permits}
        loading={loading}
        pageInfo={pageInfo}
        columns={columns}
        rowIdSelector={(row: Permit) => row.identifier}
        onPage={onPage}
        onOrderBy={onOrderBy}
      />
    </>
  );
};

export default PermitsDataTable;
