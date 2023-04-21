import React from 'react';
import { useTranslation } from 'react-i18next';
import { Order, OrderBy, PageInfo } from '../../types';
import {
  formatCustomerName,
  formatDateTimeDisplay,
  formatPrice,
} from '../../utils';
import DataTable from '../common/DataTable';
import { Column } from '../types';

const T_PATH = 'components.orders.ordersDataTable';

export interface OrdersDataTableProps {
  orders?: Order[];
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
  const { t } = useTranslation();
  const columns: Column<Order>[] = [
    {
      name: t(`${T_PATH}.permits`),
      field: 'permits',
      selector: ({ orderPermits }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {orderPermits.map((permit, index) => {
            const isLastItem = orderPermits.length === index + 1;
            const { id } = permit;
            const label = `${id}`;
            return (
              <div key={id}>
                {label}
                {!isLastItem && ','}
              </div>
            );
          })}
        </div>
      ),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.registrationNumbers`),
      field: 'vehicles',
      selector: ({ vehicles }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {vehicles.map((vehicle, index) => {
            const isLastItem = vehicles.length === index + 1;
            const id = `${vehicle}`;
            const label = `${vehicle}`;
            return (
              <div key={id}>
                {label}
                {!isLastItem && ','}
              </div>
            );
          })}
        </div>
      ),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ customer }) => formatCustomerName(customer),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'parkingZoneName',
      selector: ({ parkingZoneName }) => parkingZoneName,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.address`),
      field: 'addressText',
      selector: ({ addressText }) => addressText,
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
      name: t(`${T_PATH}.paymentType`),
      field: 'paymentType',
      selector: ({ paymentType }) =>
        paymentType === 'ONLINE_PAYMENT'
          ? t(`enums.paymentType.onlinePayment`)
          : t(`enums.paymentType.cashierPayment`),
      sortable: true,
    },
    {
      name: t(`${T_PATH}.paidTime`),
      field: 'paidTime',
      selector: ({ paidTime }) =>
        paidTime
          ? formatDateTimeDisplay(paidTime, t(`${T_PATH}.paidTimeFormat`))
          : '-',
      sortable: true,
    },
    {
      name: t(`${T_PATH}.totalPaymentPrice`),
      field: 'totalPaymentPrice',
      selector: ({ totalPaymentPrice }) => (
        <div style={{ textAlign: 'right' }}>
          {formatPrice(totalPaymentPrice)} €
        </div>
      ),
      sortable: true,
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
