import { ApolloError, useLazyQuery, useMutation } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { print, type DocumentNode } from 'graphql';
import type { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import { OrderDirection } from '../components/types';
import { getEmptyPermit } from '../components/residentPermit/consts';
import {
  ProductType,
  ProductUnit,
  RefundStatus,
  type Order,
  type OrderBy,
  type PageInfo,
  type Permit,
  type Product,
  type Refund,
  type RefundSearchParams,
  type RefundsQueryData,
} from '../types';
import Refunds from './Refunds';

const mocks = vi.hoisted(() => ({
  useLazyQuery: vi.fn(),
  getRefunds: vi.fn(),
  refetch: vi.fn(),
  useMutation: vi.fn(),
  requestForApproval: vi.fn(),
  acceptRefunds: vi.fn(),
  exportData: vi.fn(),
  formatExportUrl: vi.fn(() => 'refunds-export-url'),
  useUserRole: vi.fn(),
}));

const pageInfo: PageInfo = {
  numPages: 3,
  page: 1,
  prev: null,
  next: 2,
  startIndex: 0,
  endIndex: 1,
  count: 1,
};

const emptyPermit = getEmptyPermit();
const permit: Permit = {
  ...emptyPermit,
  id: 'permit-1',
  type: ProductType.RESIDENT,
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

const createRefund = (id: string, status: RefundStatus): Refund => ({
  id,
  name: 'Jane Doe',
  amount: 123.45,
  iban: 'FI123456789',
  status,
  description: 'Refund description',
  createdAt: '2030-01-15T10:30:00',
  createdBy: 'Admin',
  modifiedAt: '2030-01-16T10:30:00',
  modifiedBy: 'Admin',
  acceptedAt: '',
  acceptedBy: '',
  refundPermits: [permit],
  refundOrders: [order],
});

const openRefund = createRefund('refund-open', RefundStatus.OPEN);
const approvalRefund = createRefund(
  'refund-approval',
  RefundStatus.REQUEST_FOR_APPROVAL
);
const refundsData: RefundsQueryData = {
  refunds: { objects: [openRefund], pageInfo },
};

const searchParamsToSubmit: RefundSearchParams = {
  q: 'Jane Doe',
  startDate: '2030-02-01',
  endDate: '2030-02-28',
  status: RefundStatus.OPEN,
  paymentTypes: 'ONLINE_PAYMENT',
};
const defaultOrderBy: OrderBy = {
  orderField: '',
  orderDirection: OrderDirection.DESC,
};

let queryResult: { loading: boolean; data?: RefundsQueryData };
let onQueryError: ((error: ApolloError) => void) | undefined;
let onRequestCompleted: (() => void) | undefined;
let onRequestError: ((error: ApolloError) => void) | undefined;
let onAcceptCompleted: (() => void) | undefined;

const getOperationName = (query: DocumentNode) => {
  const operation = query.definitions.find(
    definition => definition.kind === 'OperationDefinition'
  );
  if (operation?.kind !== 'OperationDefinition' || !operation.name) {
    throw new Error('Expected a named GraphQL operation');
  }
  return operation.name.value;
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: mocks.useLazyQuery,
  useMutation: mocks.useMutation,
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  Notification: ({
    children,
    onClose,
  }: {
    children: ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="notification">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../api/useUserRole')>()),
  default: mocks.useUserRole,
}));

vi.mock('../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../components/refunds/RefundsSearch', () => ({
  default: ({
    searchParams,
    onSearch,
  }: {
    searchParams: RefundSearchParams;
    onSearch: (params: RefundSearchParams) => void;
  }) => (
    <div>
      <div data-testid="refunds-search-params">
        {JSON.stringify(searchParams)}
      </div>
      <button onClick={() => onSearch(searchParamsToSubmit)}>
        Submit refund filters
      </button>
    </div>
  ),
}));

vi.mock('../components/refunds/RefundsDataTable', () => ({
  default: ({
    selection,
    refunds,
    loading,
    onPage,
    onOrderBy,
    onRowClick,
    onExport,
    onSelectionChange,
  }: {
    selection?: Refund[] | null;
    refunds?: Refund[];
    loading?: boolean;
    onPage?: (page: number) => void;
    onOrderBy?: (orderBy: OrderBy) => void;
    onRowClick?: (refund: Refund) => void;
    onExport?: () => void;
    onSelectionChange?: (refunds: Refund[] | undefined) => void;
  }) => (
    <div data-testid="refunds-table" data-loading={String(loading)}>
      <div data-testid="selected-refunds">
        {selection?.map(refund => refund.id).join(',')}
      </div>
      <button onClick={() => onPage?.(3)}>Go to page 3</button>
      <button
        onClick={() =>
          onOrderBy?.({
            orderField: 'createdAt',
            orderDirection: OrderDirection.ASC,
          })
        }>
        Sort refunds
      </button>
      <button
        onClick={() => {
          const firstRefund = refunds?.[0];
          if (firstRefund) {
            onRowClick?.(firstRefund);
          }
        }}>
        Open first refund
      </button>
      <button onClick={() => onSelectionChange?.(refunds ?? [])}>
        Select all refunds
      </button>
      <button onClick={() => onSelectionChange?.([])}>Clear selection</button>
      {onExport && <button onClick={onExport}>Export refunds</button>}
    </div>
  ),
}));

vi.mock('../export/useExportData', () => ({
  default: () => mocks.exportData,
}));

vi.mock('../export/utils', () => ({
  formatExportUrl: mocks.formatExportUrl,
}));

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  return (
    <div
      data-testid="current-location"
      data-pathname={pathname}
      data-search={search}
    />
  );
};

const getCurrentSearchParams = () =>
  new URLSearchParams(
    screen.getByTestId('current-location').getAttribute('data-search') ?? ''
  );

const completeMutation = (
  callback: (() => void) | undefined,
  mutationName: string
) => {
  if (!callback) {
    throw new Error(`Expected the ${mutationName} completion callback`);
  }
  act(callback);
};

const renderRefunds = (
  initialEntry = '/refunds',
  role = UserRole.SUPER_ADMIN
) => {
  const user = userEvent.setup();
  vi.mocked(useUserRole).mockReturnValue(role);
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/refunds/:id" element={<div>Refund detail</div>} />
        <Route path="/permits" element={<div>Permits destination</div>} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.resetAllMocks();
  queryResult = { loading: false, data: refundsData };
  onQueryError = undefined;
  onRequestCompleted = undefined;
  onRequestError = undefined;
  onAcceptCompleted = undefined;
  mocks.useUserRole.mockReturnValue(UserRole.SUPER_ADMIN);

  vi.mocked(useLazyQuery).mockImplementation((_query, options) => {
    onQueryError = options?.onError;
    return [
      mocks.getRefunds,
      { ...queryResult, refetch: mocks.refetch },
    ] as unknown as ReturnType<typeof useLazyQuery>;
  });

  vi.mocked(useMutation).mockImplementation((mutation, options) => {
    const operationName = getOperationName(mutation);
    if (operationName === 'RequestForApproval') {
      onRequestCompleted = () =>
        options?.onCompleted?.({ requestForApproval: 1 });
      onRequestError = error => options?.onError?.(error);
      return [mocks.requestForApproval] as unknown as ReturnType<
        typeof useMutation
      >;
    }
    if (operationName === 'AcceptRefunds') {
      onAcceptCompleted = () => options?.onCompleted?.({ acceptRefunds: 1 });
      return [mocks.acceptRefunds] as unknown as ReturnType<typeof useMutation>;
    }
    throw new Error(`Unexpected mutation: ${operationName}`);
  });
});

describe('Refunds', () => {
  it('uses the URL page and search parameters in the query and search form', () => {
    renderRefunds(
      '/refunds?page=4&q=Jane%20Doe&startDate=2030-02-01&endDate=2030-02-28&status=OPEN&paymentTypes=ONLINE_PAYMENT'
    );

    expect(mocks.useLazyQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 4 },
          orderBy: defaultOrderBy,
          searchParams: {
            q: 'Jane Doe',
            startDate: '2030-02-01',
            endDate: '2030-02-28',
            status: RefundStatus.OPEN,
            paymentTypes: 'ONLINE_PAYMENT',
          },
        },
      })
    );
    const query = vi.mocked(useLazyQuery).mock.calls[0]?.[0];
    if (!query) {
      throw new Error('Expected the refunds query');
    }
    expect(print(query)).toContain('refunds(');
    expect(
      JSON.parse(
        screen.getByTestId('refunds-search-params').textContent || '{}'
      )
    ).toEqual({
      q: 'Jane Doe',
      startDate: '2030-02-01',
      endDate: '2030-02-28',
      status: RefundStatus.OPEN,
      paymentTypes: 'ONLINE_PAYMENT',
    });
  });

  it('passes the loading state to the refunds table', () => {
    queryResult = { loading: true };
    renderRefunds();

    expect(screen.getByTestId('refunds-table')).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('submits filters, resets the page, and updates the URL', async () => {
    const user = renderRefunds('/refunds?page=4');

    await user.click(
      screen.getByRole('button', { name: 'Submit refund filters' })
    );

    expect(mocks.getRefunds).toHaveBeenCalledWith({
      variables: {
        searchParams: searchParamsToSubmit,
        pageInput: { page: 1 },
        orderBy: defaultOrderBy,
      },
    });
    expect(Object.fromEntries(getCurrentSearchParams())).toEqual({
      ...searchParamsToSubmit,
      orderField: '',
      orderDirection: OrderDirection.DESC,
      page: '1',
    });
  });

  it('refetches for page and order changes', async () => {
    const user = renderRefunds('/refunds?page=2');

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 3 },
    });

    await user.click(screen.getByRole('button', { name: 'Sort refunds' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      orderBy: {
        orderField: 'createdAt',
        orderDirection: OrderDirection.ASC,
      },
    });
    expect(getCurrentSearchParams().get('page')).toBe('3');
    expect(getCurrentSearchParams().get('orderField')).toBe('createdAt');
    expect(getCurrentSearchParams().get('orderDirection')).toBe('ASC');
  });

  it('exports the current filters and opens the selected refund', async () => {
    const user = renderRefunds(
      '/refunds?page=2&q=Jane&status=OPEN&paymentTypes=ONLINE_PAYMENT'
    );

    await user.click(screen.getByRole('button', { name: 'Export refunds' }));
    expect(mocks.formatExportUrl).toHaveBeenCalledWith('refunds', {
      q: 'Jane',
      startDate: '',
      endDate: '',
      status: RefundStatus.OPEN,
      paymentTypes: 'ONLINE_PAYMENT',
      ...defaultOrderBy,
      page: '2',
    });
    expect(mocks.exportData).toHaveBeenCalledWith('refunds-export-url');

    await user.click(screen.getByRole('button', { name: 'Open first refund' }));
    expect(screen.getByText('Refund detail')).toBeInTheDocument();
    expect(
      screen.getByTestId('current-location').getAttribute('data-pathname')
    ).toBe('/refunds/refund-open');
  });

  it('redirects inspectors to permits', () => {
    renderRefunds('/refunds', UserRole.INSPECTORS);

    expect(screen.getByText('Permits destination')).toBeInTheDocument();
  });

  it('allows sanctions users to request approval for selected open refunds', async () => {
    const user = renderRefunds('/refunds', UserRole.SANCTIONS);
    const requestButton = screen.getByRole('button', {
      name: 'Request for approval',
    });

    expect(requestButton).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Accept refunds' })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Select all refunds' })
    );
    expect(requestButton).toBeEnabled();
    expect(screen.getByTestId('selected-refunds')).toHaveTextContent(
      'refund-open'
    );

    await user.click(requestButton);
    expect(mocks.requestForApproval).toHaveBeenCalledWith({
      variables: { ids: ['refund-open'] },
    });

    completeMutation(onRequestCompleted, 'request approval');
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('selected-refunds')).toBeEmptyDOMElement();
  });

  it('allows sanctions and refunds users to accept selected approval requests', async () => {
    queryResult = {
      loading: false,
      data: {
        refunds: {
          objects: [approvalRefund],
          pageInfo,
        },
      },
    };
    const user = renderRefunds('/refunds', UserRole.SANCTIONS_AND_REFUNDS);
    const acceptButton = screen.getByRole('button', {
      name: 'Accept refunds',
    });

    expect(acceptButton).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: 'Select all refunds' })
    );
    expect(acceptButton).toBeEnabled();
    await user.click(acceptButton);
    expect(mocks.acceptRefunds).toHaveBeenCalledWith({
      variables: { ids: ['refund-approval'] },
    });

    completeMutation(onAcceptCompleted, 'accept refunds');
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('selected-refunds')).toBeEmptyDOMElement();
  });

  it('shows and dismisses query errors', async () => {
    const user = renderRefunds();

    act(() => {
      onQueryError?.(
        new ApolloError({ errorMessage: 'Refunds request failed' })
      );
    });
    expect(screen.getByText('Refunds request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Refunds request failed')
    ).not.toBeInTheDocument();
  });

  it('shows mutation errors', async () => {
    const user = renderRefunds('/refunds', UserRole.SANCTIONS);

    await user.click(
      screen.getByRole('button', { name: 'Select all refunds' })
    );
    await user.click(
      screen.getByRole('button', { name: 'Request for approval' })
    );
    if (!onRequestError) {
      throw new Error('Expected the request approval error callback');
    }
    act(() =>
      onRequestError?.(new ApolloError({ errorMessage: 'Approval failed' }))
    );

    expect(screen.getByText('Approval failed')).toBeInTheDocument();
  });
});
