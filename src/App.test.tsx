import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import useUserRole, { UserRole } from './api/useUserRole';
import App from './App';
import { useIsAuthorizationReady } from './auth/useIsAuthReady';

const mockPageLabels = {
  login: 'Login page',
  permits: 'Permits page',
  products: 'Products page',
};
const currentPathLabel = 'Current path';
const adminProductsPath = '/admin/products';

jest.mock('./api/useUserRole', () => ({
  ...jest.requireActual('./api/useUserRole'),
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: jest.fn(),
}));
jest.mock('hds-react', () => ({ LoadingSpinner: () => 'Loading' }));
jest.mock('hds-react/components', () => ({ CookieModal: () => null }));
jest.mock('./components/Header', () => () => null);
jest.mock('./components/footer/Footer', () => () => null);
jest.mock('./components/superAdmin/SideNav', () => () => null);
jest.mock('./auth/HandleCallback', () => () => 'Callback page');
jest.mock('./pages/Login', () => () => mockPageLabels.login);
jest.mock('./pages/NotFound', () => () => 'Not found page');
jest.mock('./pages/AuthError', () => () => 'Authentication error page');
jest.mock('./pages/Permits', () => {
  const makePrivate = jest.requireActual('./auth/utils').default;
  return makePrivate(() => mockPageLabels.permits);
});
jest.mock('./pages/PermitDetail', () => () => {
  const { useParams } = jest.requireActual('react-router');
  const { id } = useParams();
  return `Permit ${id}`;
});
jest.mock('./pages/EndPermit', () => () => {
  const { useParams } = jest.requireActual('react-router');
  const { id, endType } = useParams();
  return `End permit ${id}: ${endType}`;
});
jest.mock('./pages/CreatePermit', () => () => 'Create permit page');
jest.mock('./pages/CreateCompanyPermit', () => () => null);
jest.mock('./pages/CreateResidentPermit', () => () => null);
jest.mock('./pages/EditResidentPermit', () => () => null);
jest.mock('./pages/ExtendPermit', () => () => null);
jest.mock('./pages/Orders', () => () => null);
jest.mock('./pages/RefundDetail', () => () => null);
jest.mock('./pages/Refunds', () => () => null);
jest.mock('./pages/superAdmin/addresses/Addresses', () => () => null);
jest.mock('./pages/superAdmin/addresses/CreateAddress', () => () => null);
jest.mock('./pages/superAdmin/addresses/EditAddress', () => () => null);
jest.mock('./pages/superAdmin/announcements/Announcements', () => () => null);
jest.mock(
  './pages/superAdmin/announcements/CreateAnnouncement',
  () => () => null
);
jest.mock(
  './pages/superAdmin/announcements/ViewAnnouncement',
  () => () => null
);
jest.mock('./pages/superAdmin/customers/Customers', () => () => null);
jest.mock('./pages/superAdmin/customers/ViewCustomer', () => () => null);
jest.mock(
  './pages/superAdmin/products/Products',
  () => () => mockPageLabels.products
);
jest.mock(
  './pages/superAdmin/products/CreateProduct',
  () => () => 'Create product page'
);
jest.mock('./pages/superAdmin/products/EditProduct', () => () => null);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      language: 'fi',
      changeLanguage: () =>
        new Promise(() => {
          // do nothing
        }),
    },
  }),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <output aria-label={currentPathLabel}>{location.pathname}</output>;
};

const renderRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationDisplay />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.mocked(useUserRole).mockReturnValue(UserRole.SUPER_ADMIN);
  jest
    .mocked(useIsAuthorizationReady)
    .mockReturnValue([true, false, true, true]);
});

describe('routing', () => {
  it('redirects the root to permits', async () => {
    renderRoute('/');

    expect(await screen.findByText(mockPageLabels.permits)).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent(
      '/permits'
    );
  });

  it('redirects unknown paths to the not found page', async () => {
    renderRoute('/does-not-exist');

    expect(await screen.findByText('Not found page')).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent('/404');
  });

  it('redirects an unauthenticated protected route to login', async () => {
    jest
      .mocked(useIsAuthorizationReady)
      .mockReturnValue([false, false, false, false]);
    renderRoute('/permits');

    expect(await screen.findByText(mockPageLabels.login)).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent('/login');
    expect(screen.queryByText(mockPageLabels.permits)).not.toBeInTheDocument();
  });

  it('shows login instead of protected content while the role is unknown', () => {
    jest.mocked(useUserRole).mockReturnValue(UserRole.UNKNOWN);
    renderRoute('/permits');

    expect(screen.getByText(mockPageLabels.login)).toBeInTheDocument();
    expect(screen.queryByText(mockPageLabels.permits)).not.toBeInTheDocument();
  });

  it('denies access to users without an authorized group', () => {
    jest.mocked(useUserRole).mockReturnValue(UserRole.NON_AD_GROUPS);
    renderRoute('/permits');

    expect(screen.getByText('message.unauthorized')).toBeInTheDocument();
    expect(screen.queryByText(mockPageLabels.permits)).not.toBeInTheDocument();
  });

  it('redirects the admin root and renders its nested products route', async () => {
    renderRoute('/admin');

    expect(
      await screen.findByText(mockPageLabels.products)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent(
      adminProductsPath
    );
  });

  it('matches the static admin create route instead of a product ID', () => {
    renderRoute('/admin/products/create');

    expect(screen.getByText('Create product page')).toBeInTheDocument();
  });

  it.each([
    UserRole.SANCTIONS_AND_REFUNDS,
    UserRole.SANCTIONS,
    UserRole.CUSTOMER_SERVICE,
    UserRole.PREPARATORS,
    UserRole.INSPECTORS,
  ])('redirects non-super-admin role %s away from admin pages', async role => {
    jest.mocked(useUserRole).mockReturnValue(role);
    renderRoute(adminProductsPath);

    expect(await screen.findByText(mockPageLabels.permits)).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent(
      '/permits'
    );
    expect(screen.queryByText(mockPageLabels.products)).not.toBeInTheDocument();
  });

  it('does not render admin content while the role is unknown', () => {
    jest.mocked(useUserRole).mockReturnValue(UserRole.UNKNOWN);
    renderRoute(adminProductsPath);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.queryByText(mockPageLabels.products)).not.toBeInTheDocument();
  });

  it('passes the permit ID to a parameterized route', () => {
    renderRoute('/permits/permit-123');

    expect(screen.getByText('Permit permit-123')).toBeInTheDocument();
  });

  it('passes both parameters to the end-permit route', () => {
    renderRoute('/permits/permit-123/end/immediately');

    expect(
      screen.getByText('End permit permit-123: immediately')
    ).toBeInTheDocument();
  });

  it('matches permit creation instead of treating create as an ID', () => {
    renderRoute('/permits/create');

    expect(screen.getByText('Create permit page')).toBeInTheDocument();
    expect(screen.queryByText('Permit create')).not.toBeInTheDocument();
  });
});
