import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {
  ChangeLogEvent,
  ParkingPermitStatus,
  PermitContractType,
  ProductType,
  ProductUnit,
  RefundStatus,
} from '../../types';
import type {
  ChangeLog,
  ChangeLogRelatedObject,
  Order,
  Permit,
  Product,
  Refund,
} from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import DataTable from './DataTable';
import type { DataTableProps } from './DataTable';
import ChangeLogs from './ChangeLogs';

vi.mock('./DataTable', () => ({ default: vi.fn(() => null) }));

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

const relatedObjectFields = {
  ...order,
  ...refund,
};
const orderNode: ChangeLogRelatedObject = {
  ...relatedObjectFields,
  id: order.id,
  __typename: 'OrderNode',
};
const refundNode: ChangeLogRelatedObject = {
  ...relatedObjectFields,
  __typename: 'RefundNode',
};

const changeLog: ChangeLog = {
  id: 'change-1',
  event: ChangeLogEvent.CREATED,
  key: 'create_order',
  createdAt: '2030-01-15T10:30:00',
  createdBy: 'Admin',
  validityPeriod: ['2030-02-01T10:00:00', '2030-03-01T10:00:00'],
  context: {
    changes: {
      status: ['Draft', 'Valid'],
    },
  },
  contentType: {
    model: 'permit',
    appLabel: 'parking_permits',
  },
  relatedObject: orderNode,
};

const renderChangeLogs = (changeLogs: ChangeLog[] = [changeLog]) => {
  render(<ChangeLogs changeLogs={changeLogs} />);
  const props = vi.mocked(DataTable).mock.calls[0]?.[0];
  if (!props) {
    throw new Error('Expected the change log table to render');
  }
  return props;
};

const getColumn = (
  columns: DataTableProps<ChangeLog>['columns'],
  field: string
) => {
  const column = columns.find(item => item.field === field);
  if (!column) {
    throw new Error(`Missing ${field} column`);
  }
  return column;
};

const renderColumnValues = (
  columns: DataTableProps<ChangeLog>['columns'],
  log: ChangeLog,
  fields: string[]
) =>
  render(
    <MemoryRouter>
      {fields.map(field => (
        <div data-testid={`column-${field}`} key={field}>
          {getColumn(columns, field).selector(log)}
        </div>
      ))}
    </MemoryRouter>
  );

afterEach(() => {
  vi.resetAllMocks();
});

describe('ChangeLogs', () => {
  it('passes change logs to the table with unsortable columns', () => {
    const props = renderChangeLogs();

    expect(props.data).toEqual([changeLog]);
    expect(props.rowIdSelector(changeLog)).toBe('change-1');
    expect(props.columns.map(({ field }) => field)).toEqual([
      'createdAt',
      'event',
      'key',
      'validityPeriod',
      'sum',
      'paymentType',
      'createdBy',
    ]);
    expect(props.columns.every(column => !column.sortable)).toBe(true);
  });

  it('formats order changes, dates, amount, and payment type', () => {
    const props = renderChangeLogs();

    renderColumnValues(props.columns, changeLog, [
      'createdAt',
      'event',
      'key',
      'validityPeriod',
      'sum',
      'paymentType',
      'createdBy',
    ]);

    expect(screen.getByTestId('column-createdAt')).toHaveTextContent(
      '15.1.2030 10:30'
    );
    expect(screen.getByTestId('column-event')).toHaveTextContent(
      'Order created'
    );
    expect(screen.getByTestId('column-key')).toHaveTextContent(
      'Order #order-1 has been created for permit'
    );
    expect(screen.getByTestId('column-key')).toHaveTextContent(
      'Status: Draft -> Valid'
    );
    expect(screen.getByTestId('column-validityPeriod')).toHaveTextContent(
      '1.2.2030 10:00 - 1.3.2030 10:00'
    );
    expect(screen.getByTestId('column-sum')).toHaveTextContent('12.50');
    expect(screen.getByTestId('column-paymentType')).toHaveTextContent(
      'Online payment'
    );
    expect(screen.getByTestId('column-createdBy')).toHaveTextContent('Admin');
  });

  it('links refund payment types and displays the refund amount', () => {
    const refundLog: ChangeLog = {
      ...changeLog,
      key: 'create_refund',
      relatedObject: refundNode,
    };
    const props = renderChangeLogs([refundLog]);

    renderColumnValues(props.columns, refundLog, ['sum', 'paymentType']);

    expect(screen.getByTestId('column-sum')).toHaveTextContent('123.46');
    expect(screen.getByRole('link', { name: 'Refund' })).toHaveAttribute(
      'href',
      '/refunds/refund-1'
    );
  });

  it('uses fallbacks for unknown related objects and missing creators', () => {
    const unknownLog: ChangeLog = {
      ...changeLog,
      createdBy: '',
      relatedObject: { ...orderNode, __typename: 'OtherNode' },
    };
    const props = renderChangeLogs([unknownLog]);

    renderColumnValues(props.columns, unknownLog, [
      'sum',
      'paymentType',
      'createdBy',
    ]);

    expect(screen.getByTestId('column-sum')).toBeEmptyDOMElement();
    expect(screen.getByTestId('column-paymentType')).toBeEmptyDOMElement();
    expect(screen.getByTestId('column-createdBy')).toHaveTextContent('-');
  });
});
