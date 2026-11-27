import { render, screen } from '@testing-library/react';
import { OrderDirection } from '../types';
import {
  ParkingPermitStatus,
  PermitContractType,
  ProductType,
  ProductUnit,
  RefundStatus,
} from '../../types';
import type {
  Order,
  OrderBy,
  PageInfo,
  Permit,
  Product,
  Refund,
} from '../../types';
import useUserRole, { UserRole } from '../../api/useUserRole';
import { getEmptyPermit } from '../residentPermit/consts';
import DataTable from '../common/DataTable';
import type { DataTableProps } from '../common/DataTable';
import RefundsDataTable from './RefundsDataTable';
import type { RefundsDataTableProps } from './RefundsDataTable';

vi.mock('../common/DataTable', () => ({ default: vi.fn(() => null) }));
vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));

const pageInfo: PageInfo = {
  numPages: 2,
  page: 1,
  prev: null,
  next: 2,
  startIndex: 0,
  endIndex: 1,
  count: 2,
};

const emptyPermit = getEmptyPermit();
const permit: Permit = {
  id: 'permit-1',
  type: ProductType.RESIDENT,
  customer: emptyPermit.customer,
  vehicle: {
    ...emptyPermit.vehicle,
    registrationNumber: 'ABC123',
  },
  parkingZone: emptyPermit.parkingZone,
  status: ParkingPermitStatus.VALID,
  address: emptyPermit.address,
  startTime: '2030-01-01T10:00:00',
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
  customer: emptyPermit.customer,
  paidTime: '2030-01-15T10:30:00',
  orderPermits: [permit],
  orderItemsContent: [{ id: 'item-1', product }],
  paymentType: 'ONLINE_PAYMENT',
  addressText: 'Test Street 10, Helsinki',
  parkingZoneName: 'A',
  vehicles: ['ABC123'],
  talpaOrderId: 'talpa-1',
};
const refund: Refund = {
  id: 'refund-1',
  name: 'Jane Doe',
  amount: 123.456,
  iban: 'FI123456789',
  status: RefundStatus.ACCEPTED,
  description: 'Refund description',
  createdAt: '2030-01-15T10:30:00',
  createdBy: 'Admin',
  modifiedAt: '2030-01-16T10:30:00',
  modifiedBy: 'Admin',
  acceptedAt: '2030-01-16T11:00:00',
  acceptedBy: 'Approver',
  refundPermits: [permit],
  refundOrders: [order],
};

afterEach(() => {
  vi.resetAllMocks();
});

const renderRefundsDataTable = (
  props: Partial<RefundsDataTableProps> = {},
  role = UserRole.SUPER_ADMIN
) => {
  vi.mocked(useUserRole).mockReturnValue(role);
  render(<RefundsDataTable refunds={[refund]} {...props} />);

  const dataTableProps = vi.mocked(DataTable).mock.calls[0]?.[0];
  if (!dataTableProps) {
    throw new Error('Expected the refunds data table to render');
  }
  return dataTableProps;
};

const getColumn = (
  columns: DataTableProps<Refund>['columns'],
  field: string
) => {
  const column = columns.find(item => item.field === field);
  if (!column) {
    throw new Error(`Missing ${field} column`);
  }
  return column;
};

describe('RefundsDataTable selection', () => {
  it.each([
    [UserRole.INSPECTORS, false],
    [UserRole.PREPARATORS, false],
    [UserRole.CUSTOMER_SERVICE, false],
    [UserRole.SANCTIONS, true],
    [UserRole.SANCTIONS_AND_REFUNDS, true],
    [UserRole.SUPER_ADMIN, true],
  ])('for role %s, selecting refunds is allowed: %s', (role, allowed) => {
    const props = renderRefundsDataTable({ refunds: [] }, role);
    expect(props.showCheckbox).toBe(allowed);
    expect(props.showAllSelection).toBe(allowed);
  });
});

describe('RefundsDataTable columns', () => {
  it('maps refund details into columns and forwards table props', () => {
    const callbacks = {
      onPage: vi.fn(),
      onOrderBy: vi.fn(),
      onRowClick: vi.fn(),
      onExport: vi.fn(),
      onSelectionChange: vi.fn(),
    };
    const orderBy: OrderBy = {
      orderField: 'createdAt',
      orderDirection: OrderDirection.DESC,
    };
    const dataTableProps = renderRefundsDataTable({
      refunds: [refund],
      selection: [refund],
      pageInfo,
      loading: true,
      orderBy,
      ...callbacks,
    });

    expect(dataTableProps.data).toEqual([refund]);
    expect(dataTableProps.selection).toEqual([refund]);
    expect(dataTableProps.pageInfo).toBe(pageInfo);
    expect(dataTableProps.loading).toBe(true);
    expect(dataTableProps.orderBy).toBe(orderBy);
    expect(dataTableProps.rowIdSelector(refund)).toBe('refund-1');
    expect({
      onPage: dataTableProps.onPage,
      onOrderBy: dataTableProps.onOrderBy,
      onRowClick: dataTableProps.onRowClick,
      onExport: dataTableProps.onExport,
      onSelectionChange: dataTableProps.onSelectionChange,
    }).toEqual(callbacks);
    expect(dataTableProps.columns.map(({ field }) => field)).toEqual([
      'id',
      'name',
      'orderId',
      'registrationNumber',
      'accountNumber',
      'createdAt',
      'acceptedAt',
      'status',
      'amount',
    ]);

    const expectedValues = {
      id: 'refund-1',
      name: 'Jane Doe',
      orderId: 'order-1',
      registrationNumber: 'ABC123',
      accountNumber: 'FI123456789',
      createdAt: '15.1.2030 10:30',
      acceptedAt: '16.1.2030 11:00',
    };
    for (const [field, value] of Object.entries(expectedValues)) {
      expect(getColumn(dataTableProps.columns, field).selector(refund)).toBe(
        value
      );
    }

    render(
      <>
        {getColumn(dataTableProps.columns, 'status').selector(refund)}
        {getColumn(dataTableProps.columns, 'amount').selector(refund)}
      </>
    );
    expect(screen.getByText('Accepted')).toBeVisible();
    expect(screen.getByText('123.46 €')).toBeVisible();
  });

  it('uses a fallback when a refund has not yet been accepted', () => {
    const refundWithoutAcceptedAt = { ...refund, acceptedAt: '' };
    const dataTableProps = renderRefundsDataTable({
      refunds: [refundWithoutAcceptedAt],
    });
    const acceptedAtColumn = getColumn(dataTableProps.columns, 'acceptedAt');

    expect(acceptedAtColumn.selector(refundWithoutAcceptedAt)).toBe('-');
  });
});
