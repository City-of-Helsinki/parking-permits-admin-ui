import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import type { Customer } from '../../../types';
import ViewCustomer from './ViewCustomer';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  exportData: vi.fn<(url: string | URL) => void>(),
}));

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: mocks.useQuery,
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../export/useExportData', () => ({
  default: () => mocks.exportData,
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
  language: 'en',
};

const CurrentLocation = () => {
  const { pathname } = useLocation();
  return <div data-testid="current-location" data-pathname={pathname} />;
};

const renderViewCustomer = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/admin/customers/customer-1']}>
      <Routes>
        <Route path="/admin/customers/:id" element={<ViewCustomer />} />
        <Route path="/admin/customers" element={<div>Customers list</div>} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useQuery.mockReturnValue({
    loading: false,
    data: { customer },
  });
});

describe('ViewCustomer', () => {
  it('queries and renders the customer details', () => {
    renderViewCustomer();

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { query: { id: 'customer-1' } },
        fetchPolicy: 'no-cache',
      })
    );
    expect(
      screen.getByRole('heading', { name: 'Personal information' })
    ).toBeVisible();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Return to list' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Download customer data' })
    ).toBeVisible();
  });

  it('shows a loading state while the customer is fetched', () => {
    mocks.useQuery.mockReturnValue({ loading: true });
    renderViewCustomer();

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Personal information' })
    ).not.toBeInTheDocument();
  });

  it('renders no customer details when the query returns no customer', () => {
    mocks.useQuery.mockReturnValue({
      loading: false,
      data: { customer: null },
    });
    renderViewCustomer();

    expect(
      screen.queryByRole('heading', { name: 'Personal information' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Download customer data' })
    ).not.toBeInTheDocument();
  });

  it('returns to the customer list', async () => {
    const user = renderViewCustomer();

    await user.click(screen.getByRole('button', { name: 'Return to list' }));

    expect(screen.getByTestId('current-location')).toHaveAttribute(
      'data-pathname',
      '/admin/customers'
    );
    expect(screen.getByText('Customers list')).toBeInTheDocument();
  });

  it('exports the customer data using the source ID', async () => {
    const user = renderViewCustomer();

    await user.click(
      screen.getByRole('button', { name: 'Download customer data' })
    );

    expect(mocks.exportData).toHaveBeenCalledTimes(1);
    const url = mocks.exportData.mock.calls[0][0];
    expect(url).toBeInstanceOf(URL);
    expect(new URL(url).pathname).toBe('/gdpr-api/v1/profiles/source-1');
  });
});
