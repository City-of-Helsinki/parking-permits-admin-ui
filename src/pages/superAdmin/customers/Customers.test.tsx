import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { OrderDirection } from '../../../components/types';
import type { Customer, CustomersQueryData } from '../../../types';
import Customers from './Customers';

const mocks = vi.hoisted(() => ({
  useLazyQuery: vi.fn(),
  getCustomers: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: mocks.useLazyQuery,
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

const customer: Customer = {
  id: 'customer-1',
  sourceId: 'source-1',
  firstName: 'Jane',
  lastName: 'Doe',
  nationalIdNumber: '010101-123A',
  email: 'jane@example.com',
  phoneNumber: '0401234567',
  addressSecurityBan: false,
  driverLicenseChecked: false,
};

const customersData: CustomersQueryData = {
  customers: {
    objects: [customer],
    pageInfo: {
      numPages: 3,
      page: 1,
      prev: null,
      next: 2,
      startIndex: 0,
      endIndex: 1,
      count: 3,
    },
  },
};

const setupLazyQuery = (
  overrides: { loading?: boolean; data?: CustomersQueryData } = {}
) => {
  mocks.useLazyQuery.mockReturnValue([
    mocks.getCustomers,
    {
      loading: false,
      data: customersData,
      refetch: mocks.refetch,
      ...overrides,
    },
  ]);
};

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  return (
    <div
      data-testid="current-location"
      data-pathname={pathname}
      data-search={search}
      data-navigation-type={navigationType}
    />
  );
};

const renderCustomers = (initialEntry = '/admin/customers') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/customers/*" element={<Customers />} />
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

describe('Customers', () => {
  it('uses the URL parameters and renders customer data', () => {
    renderCustomers(
      '/admin/customers?page=3&name=Jane&nationalIdNumber=010101-123A'
    );

    expect(mocks.useLazyQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          searchParams: {
            name: 'Jane',
            nationalIdNumber: '010101-123A',
          },
          pageInput: { page: 3 },
          orderBy: {
            orderField: '',
            orderDirection: OrderDirection.DESC,
          },
        },
      })
    );
    expect(screen.getByRole('heading', { name: 'Customers' })).toBeVisible();
    expect(screen.getByLabelText('Name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Personal ID')).toHaveValue('010101-123A');
    expect(screen.getByRole('cell', { name: 'Doe, Jane' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'jane@example.com' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: '0401234567' })
    ).toBeInTheDocument();
  });

  it('passes loading state to the table while customers are fetched', () => {
    setupLazyQuery({ loading: true, data: undefined });
    renderCustomers();

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Doe, Jane' })
    ).not.toBeInTheDocument();
  });

  it('searches and resets the page', async () => {
    const user = renderCustomers('/admin/customers?page=3');

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Personal ID'), '010101-123A');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(mocks.getCustomers).toHaveBeenCalledWith({
      variables: {
        searchParams: {
          name: 'Jane Doe',
          nationalIdNumber: '010101-123A',
        },
        pageInput: { page: 1 },
        orderBy: {
          orderField: '',
          orderDirection: OrderDirection.DESC,
        },
      },
    });
    expect(getSearchParams()).toEqual({
      name: 'Jane Doe',
      nationalIdNumber: '010101-123A',
      orderField: '',
      orderDirection: OrderDirection.DESC,
      page: '1',
    });
    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-navigation-type',
      'REPLACE'
    );
  });

  it('refetches for page and order changes', async () => {
    const user = renderCustomers('/admin/customers?page=3');

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 2 },
    });
    expect(getSearchParams()).toEqual({ page: '2' });

    await user.click(screen.getByRole('button', { name: 'Email' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      orderBy: {
        orderField: 'email',
        orderDirection: OrderDirection.ASC,
      },
    });
    expect(getSearchParams()).toEqual({
      page: '2',
      orderField: 'email',
      orderDirection: OrderDirection.ASC,
    });
  });

  it('navigates to customer details when a row is clicked', async () => {
    const user = renderCustomers();

    await user.click(screen.getByRole('row', { name: /Doe, Jane/ }));

    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/customers/customer-1'
    );
  });
});
