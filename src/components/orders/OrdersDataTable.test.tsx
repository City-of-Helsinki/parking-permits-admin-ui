import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDirection } from '../types';
import {
  ParkingPermitStatus,
  PermitContractType,
  ProductType,
  ProductUnit,
} from '../../types';
import type { Customer, Order, PageInfo, Permit, Product } from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import OrdersDataTable from './OrdersDataTable';
import type { OrdersDataTableProps } from './OrdersDataTable';

const emptyPermit = getEmptyPermit();
const customer: Customer = {
  ...emptyPermit.customer,
  firstName: 'Jane',
  lastName: 'Doe',
};
const permit: Permit = {
  id: 'permit-1',
  type: ProductType.RESIDENT,
  customer,
  vehicle: emptyPermit.vehicle,
  parkingZone: emptyPermit.parkingZone,
  status: ParkingPermitStatus.VALID,
  address: emptyPermit.address,
  startTime: '2030-01-01T12:00:00',
  primaryVehicle: true,
  canAdminExtendPermit: false,
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
};
const product: Product = {
  id: 'product-1',
  type: ProductType.RESIDENT,
  zone: 'A',
  unitPrice: 10,
  unit: ProductUnit.MONTHLY,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  vat: 2.4,
  vatPercentage: 24,
  lowEmissionDiscount: 0,
  lowEmissionDiscountPercentage: 0,
  secondaryVehicleIncreaseRate: 25,
  modifiedAt: '2030-01-01T10:00:00.000Z',
  modifiedBy: 'Admin',
};

const order: Order = {
  id: 'order-1',
  orderType: 'RESIDENT_PERMIT',
  totalPrice: 12.5,
  totalPaymentPrice: 12.5,
  customer,
  paidTime: '2030-01-15T10:30:00',
  orderPermits: [permit],
  orderItemsContent: [{ id: 'item-1', product }],
  paymentType: 'ONLINE_PAYMENT',
  addressText: 'Test Street 10, Helsinki',
  parkingZoneName: 'A',
  vehicles: ['ABC123'],
  talpaOrderId: 'talpa-1',
};

const pageInfo: PageInfo = {
  numPages: 3,
  page: 1,
  prev: null,
  next: 2,
  startIndex: 0,
  endIndex: 1,
  count: 3,
};

const renderOrdersTable = (overrides: Partial<OrdersDataTableProps> = {}) => {
  const callbacks = {
    onOrderBy: vi.fn(),
    onPage: vi.fn(),
    onRowClick: vi.fn(),
    onExport: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <OrdersDataTable
      orders={[order]}
      pageInfo={pageInfo}
      loading={false}
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('OrdersDataTable', () => {
  it('renders formatted order details', () => {
    renderOrdersTable();

    expect(screen.getByRole('cell', { name: 'permit-1' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'ABC123' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Doe, Jane' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'A' })).toBeVisible();
    expect(
      screen.getByRole('cell', { name: 'Test Street 10, Helsinki' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Resident permit' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'order-1' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Online payment' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '15.1.2030 10:30' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '12.50 €' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'talpa-1' })).toBeVisible();
  });

  it('uses fallback values for unknown permit types and missing paid times', () => {
    const orderWithFallbacks: Order = {
      ...order,
      id: 'order-2',
      orderPermits: [{ ...permit, type: 'UNKNOWN' }],
      paymentType: 'CASHIER_PAYMENT',
      paidTime: '',
    };
    renderOrdersTable({ orders: [orderWithFallbacks] });

    const row = screen.getByRole('row', { name: /order-2/ });
    expect(screen.getByRole('cell', { name: 'Cashier payment' })).toBeVisible();
    expect(within(row).getAllByRole('cell', { name: '-' })).toHaveLength(2);
  });

  it('forwards sorting, pagination, row click, and export actions', async () => {
    const { onExport, onOrderBy, onPage, onRowClick, user } = renderOrdersTable(
      {
        orderBy: { orderField: 'name', orderDirection: OrderDirection.DESC },
      }
    );

    await user.click(screen.getByRole('button', { name: 'Customer' }));
    expect(onOrderBy).toHaveBeenCalledWith({
      orderField: 'name',
      orderDirection: OrderDirection.ASC,
    });

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(onPage).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('row', { name: /order-1/ }));
    expect(onRowClick).toHaveBeenCalledWith(order);

    await user.click(
      screen.getByRole('button', { name: 'Download the results as a csv file' })
    );
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state instead of order rows', () => {
    renderOrdersTable({ loading: true });

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Doe, Jane' })
    ).not.toBeInTheDocument();
  });
});
