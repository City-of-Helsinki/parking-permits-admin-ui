import React from 'react';
import { useTranslation } from 'react-i18next';
import { Order, OrderBy, PageInfo } from '../../types';
import {
  formatCustomerName,
  formatDateTimeDisplay,
  formatParkingZone,
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
            const { id, vehicle } = permit;
            const { registrationNumber } = vehicle;
            const label = `${id} (${registrationNumber})`;
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
      field: 'parkingZone',
      selector: ({ orderItemsContent }) =>
        formatParkingZone(orderItemsContent[0]),
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
