import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Order, OrderBy, PageInfo } from '../../types';
import {
  formatCustomerName,
  formatDateTimeDisplay,
  formatParkingZone,
  formatPermitAddresses,
  formatPrice,
} from '../../utils';
import DataTable from '../common/DataTable';
import { Column } from '../types';

const T_PATH = 'components.orders.ordersDataTable';

export interface OrdersDataTableProps {
  orders: Order[];
  pageInfo?: PageInfo;
  loading?: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy?: (orderBy: OrderBy) => void;
  onRowClick?: (order: Order) => void;
  onExport?: () => void;
}

const OrdersDataTable = ({
  orders,
  pageInfo,
  loading = false,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: OrdersDataTableProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const columns: Column<Order>[] = [
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ customer }) => formatCustomerName(customer),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.permits`),
      field: 'permits',
      selector: ({ orderPermits }) => (
        <>
          {orderPermits.map(permit => {
            const { id, vehicle } = permit;
            const { registrationNumber } = vehicle;
            const label = `${id} (${registrationNumber})`;
            return (
              <Link style={{ marginRight: 10 }} key={id} to={`/permits/${id}`}>
                {label}
              </Link>
            );
          })}
        </>
      ),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'parkingZone',
      selector: ({ orderPermits }) => formatParkingZone(orderPermits[0]),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.address`),
      field: 'address',
      selector: ({ orderPermits }) =>
        formatPermitAddresses(orderPermits, i18n.language),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.permitType`),
      field: 'permitType',
      selector: ({ orderPermits }) =>
        orderPermits[0]?.type === 'RESIDENT'
          ? t(`${T_PATH}.residentPermit`)
          : t(`${T_PATH}.companyPermit`),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.orderNumber`),
      field: 'id',
      selector: ({ id }) => id,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.paidTime`),
      field: 'paidTime',
      selector: ({ paidTime }) =>
        paidTime ? formatDateTimeDisplay(paidTime) : '-',
      sortable: true,
    },
    {
      name: t(`${T_PATH}.totalPrice`),
      field: 'totalPrice',
      selector: ({ totalPrice }) => formatPrice(totalPrice),
      sortable: false,
    },
  ];

  return (
    <DataTable
      data={orders}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(order: Order) => order.id}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
      onExport={onExport}
    />
  );
};

export default OrdersDataTable;
