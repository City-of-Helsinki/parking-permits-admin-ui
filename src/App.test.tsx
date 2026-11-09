import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
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

vi.mock('./api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('./api/useUserRole')>()),
  default: vi.fn(),
}));
vi.mock('./auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: vi.fn(),
}));
vi.mock('hds-react', () => ({ LoadingSpinner: () => 'Loading' }));
vi.mock('hds-react/components', () => ({ CookieModal: () => null }));
vi.mock('./components/Header', () => ({ default: () => null }));
vi.mock('./components/footer/Footer', () => ({ default: () => null }));
vi.mock('./components/superAdmin/SideNav', () => ({ default: () => null }));
vi.mock('./auth/HandleCallback', () => ({ default: () => 'Callback page' }));
vi.mock('./pages/Login', () => ({ default: () => mockPageLabels.login }));
vi.mock('./pages/NotFound', () => ({ default: () => 'Not found page' }));
vi.mock('./pages/AuthError', () => ({
  default: () => 'Authentication error page',
}));
vi.mock('./pages/Permits', async () => {
  const { default: makePrivate } = await vi.importActual<
    typeof import('./auth/utils')
  >('./auth/utils');
  return { default: makePrivate(() => mockPageLabels.permits) };
});
vi.mock('./pages/PermitDetail', async () => {
  const { useParams } = await import('react-router');
  return {
    default: function PermitDetail() {
      const { id } = useParams();
      return `Permit ${id}`;
    },
  };
});
vi.mock('./pages/EndPermit', async () => {
  const { useParams } = await import('react-router');
  return {
    default: function EndPermit() {
      const { id, endType } = useParams();
      return `End permit ${id}: ${endType}`;
    },
  };
});
vi.mock('./pages/CreatePermit', () => ({
  default: () => 'Create permit page',
}));
vi.mock('./pages/CreateCompanyPermit', () => ({ default: () => null }));
vi.mock('./pages/CreateResidentPermit', () => ({ default: () => null }));
vi.mock('./pages/EditResidentPermit', () => ({ default: () => null }));
vi.mock('./pages/ExtendPermit', () => ({ default: () => null }));
vi.mock('./pages/Orders', () => ({ default: () => null }));
vi.mock('./pages/RefundDetail', () => ({ default: () => null }));
vi.mock('./pages/Refunds', () => ({ default: () => null }));
vi.mock('./pages/superAdmin/addresses/Addresses', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/addresses/CreateAddress', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/addresses/EditAddress', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/announcements/Announcements', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/announcements/CreateAnnouncement', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/announcements/ViewAnnouncement', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/customers/Customers', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/customers/ViewCustomer', () => ({
  default: () => null,
}));
vi.mock('./pages/superAdmin/products/Products', () => ({
  default: () => mockPageLabels.products,
}));
vi.mock('./pages/superAdmin/products/CreateProduct', () => ({
  default: () => 'Create product page',
}));
vi.mock('./pages/superAdmin/products/EditProduct', () => ({
  default: () => null,
}));

vi.mock('react-i18next', () => ({
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
  vi.mocked(useUserRole).mockReturnValue(UserRole.SUPER_ADMIN);
  vi.mocked(useIsAuthorizationReady).mockReturnValue([true, false, true, true]);
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
    vi.mocked(useIsAuthorizationReady).mockReturnValue([
      false,
      false,
      false,
      false,
    ]);
    renderRoute('/permits');

    expect(await screen.findByText(mockPageLabels.login)).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent('/login');
    expect(screen.queryByText(mockPageLabels.permits)).not.toBeInTheDocument();
  });

  it('shows login instead of protected content while the role is unknown', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.UNKNOWN);
    renderRoute('/permits');

    expect(screen.getByText(mockPageLabels.login)).toBeInTheDocument();
    expect(screen.queryByText(mockPageLabels.permits)).not.toBeInTheDocument();
  });

  it('denies access to users without an authorized group', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.NON_AD_GROUPS);
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

  it('matches the static admin create route instead of a product ID', async () => {
    renderRoute('/admin/products/create');

    expect(await screen.findByText('Create product page')).toBeInTheDocument();
  });

  it.each([
    UserRole.SANCTIONS_AND_REFUNDS,
    UserRole.SANCTIONS,
    UserRole.CUSTOMER_SERVICE,
    UserRole.PREPARATORS,
    UserRole.INSPECTORS,
  ])('redirects non-super-admin role %s away from admin pages', async role => {
    vi.mocked(useUserRole).mockReturnValue(role);
    renderRoute(adminProductsPath);

    expect(await screen.findByText(mockPageLabels.permits)).toBeInTheDocument();
    expect(screen.getByLabelText(currentPathLabel)).toHaveTextContent(
      '/permits'
    );
    expect(screen.queryByText(mockPageLabels.products)).not.toBeInTheDocument();
  });

  it('does not render admin content while the role is unknown', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.UNKNOWN);
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
