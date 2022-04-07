import React from 'react';
import { useTranslation } from 'react-i18next';
import { Order, OrderBy, PageInfo } from '../../types';
import {
  formatAddresses,
  formatCustomerName,
  formatDateTimeDisplay,
  formatParkingZones,
  formatPermitType,
  formatRegistrationNumbers,
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
}

const OrdersDataTable = ({
  orders,
  pageInfo,
  loading = false,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
}: OrdersDataTableProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const columns: Column<Order>[] = [
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ customer }) => formatCustomerName(customer),
      orderFields: ['customer__first_name', 'customer__last_name'],
    },
    {
      name: t(`${T_PATH}.registrationNumber`),
      field: 'registrationNumber',
      selector: ({ orderPermits }) => formatRegistrationNumbers(orderPermits),
      orderFields: ['permits__vehicle__registration_number'],
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'parkingZone',
      selector: ({ orderPermits }) => formatParkingZones(orderPermits),
      orderFields: ['permits__parking_zone__name'],
    },
    {
      name: t(`${T_PATH}.address`),
      field: 'address',
      selector: ({ orderPermits }) =>
        formatAddresses(orderPermits, i18n.language),
      orderFields: [
        'permits__address__street_name',
        'permits__address__street_number',
      ],
    },
    {
      name: t(`${T_PATH}.permitType`),
      field: 'permitType',
      selector: ({ orderPermits }) =>
        formatPermitType(
          orderPermits[0],
          t(`${T_PATH}.residentPermit`),
          t(`${T_PATH}.companyPermit`)
        ),
      orderFields: ['permits__type'],
    },
    {
      name: t(`${T_PATH}.orderNumber`),
      field: 'orderNumber',
      selector: ({ orderNumber }) => orderNumber,
      orderFields: ['order_number'],
    },
    {
      name: t(`${T_PATH}.paidTime`),
      field: 'paidTime',
      selector: ({ paidTime }) => formatDateTimeDisplay(paidTime),
      orderFields: ['paid_time'],
    },
    {
      name: t(`${T_PATH}.totalPrice`),
      field: 'totalPrice',
      selector: ({ totalPrice }) => totalPrice,
    },
  ];

  return (
    <DataTable
      data={orders}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(order: Order) => order.orderNumber}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
    />
  );
};

export default OrdersDataTable;
