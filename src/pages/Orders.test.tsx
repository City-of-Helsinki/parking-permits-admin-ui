import { ApolloError, useLazyQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { OrderDirection } from '../components/types';
import type { OrderBy, OrdersQueryData, PageInfo } from '../types';
import useUserRole, { UserRole } from '../api/useUserRole';
import Orders from './Orders';

const mocks = vi.hoisted(() => ({
  useLazyQuery: vi.fn(),
  getOrders: vi.fn(),
  refetch: vi.fn(),
  exportData: vi.fn(),
  formatExportUrl: vi.fn<
    (
      dataType: string,
      searchParams: Record<string, string> | URLSearchParams
    ) => string
  >(() => 'orders-export-url'),
  useUserRole: vi.fn(),
}));

const pageInfo: PageInfo = {
  numPages: 3,
  page: 1,
  prev: null,
  next: 2,
  startIndex: 0,
  endIndex: 0,
  count: 0,
};

const ordersData: OrdersQueryData = {
  orders: { objects: [], pageInfo },
};

const searchParamsToSubmit = {
  q: 'Jane Doe',
  startDate: '2030-02-01',
  endDate: '2030-02-28',
  parkingZone: 'B',
  contractTypes: 'FIXED_PERIOD',
  paymentTypes: 'ONLINE_PAYMENT',
  priceDiscounts: 'LOW_EMISSION',
};

let queryResult: { loading: boolean; data?: OrdersQueryData };
let onQueryError: ((error: ApolloError) => void) | undefined;

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: mocks.useLazyQuery,
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

vi.mock('../components/orders/OrdersSearch', () => ({
  default: ({
    searchParams,
    onSubmit,
  }: {
    searchParams: Record<string, string>;
    onSubmit: (params: typeof searchParamsToSubmit) => void;
  }) => (
    <div>
      <div data-testid="orders-search-params">
        {JSON.stringify(searchParams)}
      </div>
      <button onClick={() => onSubmit(searchParamsToSubmit)}>
        Submit filters
      </button>
    </div>
  ),
}));

vi.mock('../components/orders/OrdersDataTable', () => ({
  default: ({
    loading,
    onPage,
    onOrderBy,
    onExport,
  }: {
    loading: boolean;
    onPage?: (page: number) => void;
    onOrderBy?: (orderBy: OrderBy) => void;
    onExport?: () => void;
  }) => (
    <div data-testid="orders-table" data-loading={String(loading)}>
      <button onClick={() => onPage?.(3)}>Go to page 3</button>
      <button
        onClick={() =>
          onOrderBy?.({
            orderField: 'id',
            orderDirection: OrderDirection.ASC,
          })
        }>
        Sort orders
      </button>
      <button onClick={onExport}>Export orders</button>
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

const renderOrders = (initialEntry = '/orders') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/orders" element={<Orders />} />
        <Route path="/permits" element={<div>Permits destination</div>} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.resetAllMocks();
  onQueryError = undefined;
  queryResult = { loading: false, data: ordersData };
  mocks.useUserRole.mockReturnValue(UserRole.SUPER_ADMIN);
  vi.mocked(useLazyQuery).mockImplementation((_query, options) => {
    onQueryError = options?.onError;
    return [
      mocks.getOrders,
      { ...queryResult, refetch: mocks.refetch },
    ] as unknown as ReturnType<typeof useLazyQuery>;
  });
});

describe('Orders', () => {
  it('uses the URL page and search parameters in the query and search form', () => {
    renderOrders(
      '/orders?page=4&q=Jane%20Doe&startDate=2030-02-01&endDate=2030-02-28&parkingZone=A&contractTypes=FIXED_PERIOD&paymentTypes=ONLINE_PAYMENT&priceDiscounts=LOW_EMISSION'
    );

    expect(mocks.useLazyQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 4 },
          orderBy: {
            orderField: '',
            orderDirection: OrderDirection.DESC,
          },
        },
      })
    );
    expect(
      JSON.parse(screen.getByTestId('orders-search-params').textContent || '{}')
    ).toEqual({
      q: 'Jane Doe',
      startDate: '1.2.2030',
      endDate: '28.2.2030',
      parkingZone: 'A',
      contractTypes: 'FIXED_PERIOD',
      paymentTypes: 'ONLINE_PAYMENT',
      priceDiscounts: 'LOW_EMISSION',
    });
  });

  it('passes loading state to the orders table', () => {
    queryResult = { loading: true };
    renderOrders();

    expect(screen.getByTestId('orders-table')).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('submits filters, resets the page, and updates the URL', async () => {
    const user = renderOrders('/orders?page=4');

    await user.click(screen.getByRole('button', { name: 'Submit filters' }));

    expect(mocks.getOrders).toHaveBeenCalledWith({
      variables: {
        searchParams: searchParamsToSubmit,
        pageInput: { page: 1 },
        orderBy: {
          orderField: '',
          orderDirection: OrderDirection.DESC,
        },
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
    const user = renderOrders('/orders?page=2');

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 3 },
    });

    await user.click(screen.getByRole('button', { name: 'Sort orders' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      orderBy: {
        orderField: 'id',
        orderDirection: OrderDirection.ASC,
      },
    });
    expect(getCurrentSearchParams().get('page')).toBe('3');
    expect(getCurrentSearchParams().get('orderField')).toBe('id');
    expect(getCurrentSearchParams().get('orderDirection')).toBe('ASC');
  });

  it('exports the current URL search parameters', async () => {
    const user = renderOrders('/orders?page=2&q=Jane');

    await user.click(screen.getByRole('button', { name: 'Export orders' }));

    expect(mocks.formatExportUrl).toHaveBeenCalledWith(
      'orders',
      expect.any(URLSearchParams)
    );
    const exportParams = mocks.formatExportUrl.mock.calls[0]?.[1];
    expect(exportParams).toBeInstanceOf(URLSearchParams);
    if (!(exportParams instanceof URLSearchParams)) {
      throw new Error('Expected export parameters to be URLSearchParams');
    }
    expect(exportParams.toString()).toBe('page=2&q=Jane');
    expect(mocks.exportData).toHaveBeenCalledWith('orders-export-url');
  });

  it('redirects users below the preparator role', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.INSPECTORS);
    renderOrders();

    expect(screen.getByText('Permits destination')).toBeInTheDocument();
    expect(screen.queryByTestId('orders-table')).not.toBeInTheDocument();
  });

  it('shows and dismisses query errors', async () => {
    const user = renderOrders();

    act(() => {
      onQueryError?.(
        new ApolloError({ errorMessage: 'Orders request failed' })
      );
    });
    expect(screen.getByText('Orders request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Orders request failed')).not.toBeInTheDocument();
  });
});
