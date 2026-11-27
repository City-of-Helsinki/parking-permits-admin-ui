import { ApolloError, useLazyQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { print } from 'graphql';
import type { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import { OrderDirection } from '../components/types';
import { ParkingPermitStatus, PermitContractType } from '../types';
import type {
  LimitedPermitsQueryData,
  OrderBy,
  PageInfo,
  Permit,
  PermitSearchParams,
  PermitsQueryData,
} from '../types';
import { getEmptyPermit } from '../components/residentPermit/consts';
import Permits from './Permits';

const mocks = vi.hoisted(() => ({
  useLazyQuery: vi.fn(),
  getPermits: vi.fn(),
  refetch: vi.fn(),
  exportData: vi.fn(),
  formatExportUrl: vi.fn(() => 'permits-export-url'),
  navigate: vi.fn(),
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
  id: 'permit-1',
  type: 'resident',
  customer: emptyPermit.customer,
  vehicle: {
    ...emptyPermit.vehicle,
    registrationNumber: 'ABC123',
  },
  parkingZone: {
    ...emptyPermit.parkingZone,
    name: 'Zone A',
  },
  status: ParkingPermitStatus.VALID,
  address: emptyPermit.address,
  startTime: '2030-01-01T10:00:00',
  primaryVehicle: true,
  canAdminExtendPermit: false,
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
};

const permitsData: PermitsQueryData = {
  permits: { objects: [permit], pageInfo },
};
const limitedPermitsData: LimitedPermitsQueryData = {
  limitedPermits: { objects: [permit], pageInfo },
};
const searchParamsToSubmit: PermitSearchParams = {
  status: ParkingPermitStatus.CANCELLED,
  q: 'ABC123',
};
const defaultOrderBy: OrderBy = {
  orderField: '',
  orderDirection: OrderDirection.DESC,
};

type PermitsQueryResult = PermitsQueryData | LimitedPermitsQueryData;

let queryResult: { loading: boolean; data?: PermitsQueryResult };
let onQueryError: ((error: ApolloError) => void) | undefined;

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: mocks.useLazyQuery,
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
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

vi.mock('../components/permits/PermitsSearch', () => ({
  default: ({
    searchParams,
    onSearch,
  }: {
    searchParams: PermitSearchParams;
    onSearch: (params: PermitSearchParams) => void;
  }) => (
    <div>
      <div data-testid="permits-search-params">
        {JSON.stringify(searchParams)}
      </div>
      <button onClick={() => onSearch(searchParamsToSubmit)}>
        Submit permit filters
      </button>
    </div>
  ),
}));

vi.mock('../components/permits/PermitsDataTable', () => ({
  default: ({
    permits,
    pageInfo: currentPageInfo,
    loading,
    onPage,
    onOrderBy,
    onRowClick,
    onExport,
  }: {
    permits?: Permit[];
    pageInfo?: PageInfo;
    loading: boolean;
    onPage?: (page: number) => void;
    onOrderBy?: (orderBy: OrderBy) => void;
    onRowClick?: (permit: Permit) => void;
    onExport?: () => void;
  }) => (
    <div
      data-testid="permits-table"
      data-loading={String(loading)}
      data-permit-ids={permits?.map(({ id }) => id).join(',') ?? ''}
      data-page={currentPageInfo?.page ?? ''}>
      <button onClick={() => onPage?.(3)}>Go to page 3</button>
      <button
        onClick={() =>
          onOrderBy?.({
            orderField: 'id',
            orderDirection: OrderDirection.ASC,
          })
        }>
        Sort permits
      </button>
      <button onClick={() => permits?.[0] && onRowClick?.(permits[0])}>
        Open first permit
      </button>
      {onExport && <button onClick={onExport}>Export permits</button>}
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

const getQueryText = () => {
  const query = vi.mocked(useLazyQuery).mock.calls[0]?.[0];
  if (!query) {
    throw new Error('Expected the permits query');
  }
  return print(query);
};

const renderPermits = (
  initialEntry = '/permits',
  role = UserRole.SUPER_ADMIN
) => {
  const user = userEvent.setup();
  vi.mocked(useUserRole).mockReturnValue(role);
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/permits" element={<Permits />} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.resetAllMocks();
  onQueryError = undefined;
  queryResult = { loading: false, data: permitsData };
  mocks.useUserRole.mockReturnValue(UserRole.SUPER_ADMIN);
  vi.mocked(useLazyQuery).mockImplementation((_query, options) => {
    onQueryError = options?.onError;
    return [
      mocks.getPermits,
      { ...queryResult, refetch: mocks.refetch },
    ] as unknown as ReturnType<typeof useLazyQuery>;
  });
});

describe('Permits', () => {
  it('uses the URL page and filters in the query and search component', () => {
    renderPermits('/permits?page=4&status=VALID&q=ABC123');

    expect(mocks.useLazyQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 4 },
          orderBy: defaultOrderBy,
          searchParams: {
            status: ParkingPermitStatus.VALID,
            q: 'ABC123',
          },
        },
      })
    );
    const queryText = getQueryText();
    expect(queryText).toContain('permits(');
    expect(queryText).not.toContain('limitedPermits(');
    expect(
      JSON.parse(
        screen.getByTestId('permits-search-params').textContent || '{}'
      )
    ).toEqual({ status: ParkingPermitStatus.VALID, q: 'ABC123' });
    expect(screen.getByTestId('permits-table')).toHaveAttribute(
      'data-permit-ids',
      'permit-1'
    );
  });

  it('passes the loading state to the permits table', () => {
    queryResult = { loading: true };
    renderPermits();

    expect(screen.getByTestId('permits-table')).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('submits filters, resets the page, and updates the URL', async () => {
    const user = renderPermits('/permits?page=4');

    await user.click(
      screen.getByRole('button', { name: 'Submit permit filters' })
    );

    expect(mocks.getPermits).toHaveBeenCalledWith({
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
    const user = renderPermits('/permits?page=2');

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 3 },
    });

    await user.click(screen.getByRole('button', { name: 'Sort permits' }));
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

  it('exports the current filters and lets super admins create permits', async () => {
    const user = renderPermits('/permits?page=2&status=VALID&q=ABC123');

    await user.click(screen.getByRole('button', { name: 'Export permits' }));
    expect(mocks.formatExportUrl).toHaveBeenCalledWith('permits', {
      status: ParkingPermitStatus.VALID,
      q: 'ABC123',
      orderField: '',
      orderDirection: OrderDirection.DESC,
      page: '2',
    });
    expect(mocks.exportData).toHaveBeenCalledWith('permits-export-url');

    await user.click(screen.getByRole('button', { name: 'Create new permit' }));
    expect(mocks.navigate).toHaveBeenCalledWith('create');
  });

  it('uses limited permit results and hides admin actions from inspectors', async () => {
    queryResult = { loading: false, data: limitedPermitsData };
    const user = renderPermits('/permits', UserRole.INSPECTORS);

    const queryText = getQueryText();
    expect(queryText).toContain('limitedPermits(');
    expect(queryText).not.toContain('permits(');
    expect(screen.getByTestId('permits-table')).toHaveAttribute(
      'data-permit-ids',
      'permit-1'
    );
    expect(
      screen.queryByRole('button', { name: 'Create new permit' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Export permits' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open first permit' }));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('allows preparators to open permits but not create them', async () => {
    const user = renderPermits('/permits', UserRole.PREPARATORS);

    expect(
      screen.queryByRole('button', { name: 'Create new permit' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Export permits' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open first permit' }));
    expect(mocks.navigate).toHaveBeenCalledWith('permit-1');
  });

  it('shows and dismisses query errors', async () => {
    const user = renderPermits();

    act(() => {
      onQueryError?.(
        new ApolloError({ errorMessage: 'Permits request failed' })
      );
    });
    expect(screen.getByText('Permits request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Permits request failed')
    ).not.toBeInTheDocument();
  });
});
