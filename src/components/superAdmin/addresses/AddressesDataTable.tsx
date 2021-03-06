import React from 'react';
import { useTranslation } from 'react-i18next';
import { Address, OrderBy, PageInfo } from '../../../types';
import DataTable from '../../common/DataTable';
import { Column } from '../../types';

const T_PATH = 'components.superAdmin.addresses.addressesDataTable';

export interface AddressesDataTableProps {
  addresses: Address[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (product: Address) => void;
  onExport?: () => void;
}

const AddressesDataTable = ({
  addresses,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: AddressesDataTableProps): React.ReactElement => {
  const { t } = useTranslation();
  const columns: Column<Address>[] = [
    {
      name: t(`${T_PATH}.streetName`),
      field: 'streetName',
      selector: address => address.streetName,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.streetNameSv`),
      field: 'streetNameSv',
      selector: address => address.streetNameSv,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.streetNumber`),
      field: 'streetNumber',
      selector: address => address.streetNumber,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.postalCode`),
      field: 'postalCode',
      selector: address => address.postalCode,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.city`),
      field: 'city',
      selector: address => address.city,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.citySv`),
      field: 'citySv',
      selector: address => address.citySv,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'zone',
      selector: address => address.zone?.name,
      sortable: true,
    },
  ];

  return (
    <DataTable
      data={addresses}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(address: Address) => address.id as string}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
      onExport={onExport}
    />
  );
};

export default AddressesDataTable;
