import { render, screen } from '@testing-library/react';
import { useOidcClient } from 'hds-react';
import { MemoryRouter } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import Header from './Header';

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: vi.fn(),
  WithAuthentication: () => null,
}));
vi.mock('./auth/Login', () => ({ default: () => null }));
vi.mock('./auth/Logout', () => ({ default: () => null }));
vi.mock('../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../api/useUserRole')>()),
  default: vi.fn(),
}));

const PERMITS = 'components.header.permits';
const ORDERS = 'components.header.orders';
const REFUNDS = 'components.header.refunds';
const ADMIN = 'components.header.admin';

const renderHeader = (role: UserRole) => {
  vi.mocked(useUserRole).mockReturnValue(role);
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  const navLabels = [PERMITS, ORDERS, REFUNDS, ADMIN];
  return screen
    .queryAllByText(label => navLabels.includes(label))
    .map(element => element.textContent);
};

beforeEach(() => {
  vi.mocked(useOidcClient).mockReturnValue({
    isAuthenticated: () => true,
  } as unknown as ReturnType<typeof useOidcClient>);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('Header navigation', () => {
  it.each([
    [UserRole.INSPECTORS, [PERMITS]],
    [UserRole.PREPARATORS, [PERMITS, ORDERS, REFUNDS]],
    [UserRole.CUSTOMER_SERVICE, [PERMITS, ORDERS, REFUNDS]],
    [UserRole.SANCTIONS, [PERMITS, ORDERS, REFUNDS]],
    [UserRole.SANCTIONS_AND_REFUNDS, [PERMITS, ORDERS, REFUNDS]],
    [UserRole.SUPER_ADMIN, [PERMITS, ORDERS, REFUNDS, ADMIN]],
  ])('shows the right links for role %s', (role, links) => {
    expect(renderHeader(role)).toEqual(links);
  });

  it.each([UserRole.NON_AD_GROUPS, UserRole.UNKNOWN, UserRole.LOADING])(
    'shows no navigation for role %s',
    role => {
      expect(renderHeader(role)).toEqual([]);
    }
  );
});
