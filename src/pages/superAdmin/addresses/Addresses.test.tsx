import { ApolloError } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router';
import type { AddressesDataTableProps } from '../../../components/superAdmin/addresses/AddressesDataTable';
import type { AddressesSearchProps } from '../../../components/superAdmin/addresses/AddressesSearch';
import { OrderDirection } from '../../../components/types';
import type { Address, AddressesQueryData } from '../../../types';
import Addresses from './Addresses';

const mocks = vi.hoisted(() => ({
  useLazyQuery: vi.fn(),
  getAddresses: vi.fn(),
  refetch: vi.fn(),
}));

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

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../components/superAdmin/addresses/AddressesSearch', () => ({
  default: ({ searchParams, onSearch }: AddressesSearchProps) => (
    <div>
      <div data-testid="initial-search">{JSON.stringify(searchParams)}</div>
      <button
        onClick={() =>
          onSearch({
            streetName: 'Main Street',
            streetNumber: '12',
            postalCode: '00100',
            parkingZone: 'A',
          })
        }>
        Search addresses
      </button>
    </div>
  ),
}));

vi.mock('../../../components/superAdmin/addresses/AddressesDataTable', () => ({
  default: ({
    addresses,
    loading,
    onPage,
    onOrderBy,
    onRowClick,
  }: AddressesDataTableProps) => (
    <div data-testid="addresses-table" data-loading={loading}>
      <div data-testid="address-ids">
        {addresses.map(address => address.id).join(',')}
      </div>
      <button onClick={() => onPage?.(4)}>Go to page 4</button>
      <button
        onClick={() =>
          onOrderBy({
            orderField: 'streetName',
            orderDirection: OrderDirection.DESC,
          })
        }>
        Sort addresses
      </button>
      {addresses[0] && (
        <button onClick={() => onRowClick?.(addresses[0])}>Open address</button>
      )}
    </div>
  ),
}));

const address: Address = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Testgatan',
  streetNumber: '1',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
  zone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
};

const addressesData: AddressesQueryData = {
  addresses: {
    objects: [address],
    pageInfo: {
      numPages: 1,
      page: 1,
      prev: null,
      next: null,
      startIndex: 0,
      endIndex: 1,
      count: 1,
    },
  },
};

const setupLazyQuery = (
  overrides: { loading?: boolean; data?: AddressesQueryData } = {}
) => {
  mocks.useLazyQuery.mockReturnValue([
    mocks.getAddresses,
    {
      loading: false,
      data: addressesData,
      refetch: mocks.refetch,
      ...overrides,
    },
  ]);
};

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  return (
    <output
      data-testid="current-location"
      data-pathname={pathname}
      data-search={search}
      data-navigation-type={navigationType}
    />
  );
};

const renderAddresses = (initialEntry = '/admin/addresses') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/addresses/*" element={<Addresses />} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

const getSearchParams = () =>
  Object.fromEntries(
    new URLSearchParams(
      screen.getByTestId('current-location').getAttribute('data-search') ?? ''
    )
  );

beforeEach(() => {
  vi.clearAllMocks();
  setupLazyQuery();
});

describe('Addresses', () => {
  it('uses URL pagination and search parameters and displays returned addresses', () => {
    renderAddresses(
      '/admin/addresses?page=3&streetName=Harbor&streetNumber=1&postalCode=00100&parkingZone=B'
    );

    expect(mocks.useLazyQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 3 },
          orderBy: {
            orderField: '',
            orderDirection: OrderDirection.DESC,
          },
        },
      })
    );
    expect(screen.getByTestId('initial-search')).toHaveTextContent(
      JSON.stringify({
        streetName: 'Harbor',
        streetNumber: '1',
        postalCode: '00100',
        parkingZone: 'B',
      })
    );
    expect(screen.getByTestId('address-ids')).toHaveTextContent('address-1');
  });

  it('passes loading state and an empty list through before data arrives', () => {
    setupLazyQuery({ loading: true, data: undefined });
    renderAddresses();

    expect(screen.getByTestId('addresses-table')).toHaveAttribute(
      'data-loading',
      'true'
    );
    expect(screen.getByTestId('address-ids')).toBeEmptyDOMElement();
  });

  it('searches and resets the page', async () => {
    const user = renderAddresses('/admin/addresses?page=3');

    await user.click(screen.getByRole('button', { name: 'Search addresses' }));

    expect(mocks.getAddresses).toHaveBeenCalledWith({
      variables: {
        searchParams: {
          streetName: 'Main Street',
          streetNumber: '12',
          postalCode: '00100',
          parkingZone: 'A',
        },
        pageInput: { page: 1 },
        orderBy: {
          orderField: '',
          orderDirection: OrderDirection.DESC,
        },
      },
    });
    expect(getSearchParams()).toEqual({
      streetName: 'Main Street',
      streetNumber: '12',
      postalCode: '00100',
      parkingZone: 'A',
      orderDirection: 'DESC',
      orderField: '',
      page: '1',
    });
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-navigation-type',
      'REPLACE'
    );
  });

  it('refetches when the page or order changes', async () => {
    const user = renderAddresses('/admin/addresses?page=2');

    await user.click(screen.getByRole('button', { name: 'Go to page 4' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 4 },
    });
    expect(getSearchParams()).toEqual({ page: '4' });

    await user.click(screen.getByRole('button', { name: 'Sort addresses' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      orderBy: {
        orderField: 'streetName',
        orderDirection: OrderDirection.DESC,
      },
    });
    expect(getSearchParams()).toEqual({
      page: '4',
      orderField: 'streetName',
      orderDirection: 'DESC',
    });
  });

  it('navigates to create and address detail pages', async () => {
    const user = renderAddresses();

    await user.click(screen.getByRole('button', { name: 'Add new address' }));
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/addresses/create'
    );
  });

  it('navigates to an address when its row is clicked', async () => {
    const user = renderAddresses();

    await user.click(screen.getByRole('button', { name: 'Open address' }));
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/addresses/address-1'
    );
  });

  it('shows and dismisses query errors', async () => {
    const user = renderAddresses();
    const queryOptions = mocks.useLazyQuery.mock.calls[0][1] as {
      onError: (error: ApolloError) => void;
    };

    act(() => {
      queryOptions.onError(new ApolloError({ errorMessage: 'Request failed' }));
    });
    expect(screen.getByText('Request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Request failed')).not.toBeInTheDocument();
  });
});
