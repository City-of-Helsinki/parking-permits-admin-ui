import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { fireEvent, render, screen } from '@testing-library/react';
import { print } from 'graphql';
import { MemoryRouter, Route, Routes } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import { useIsAuthorizationReady } from '../auth/useIsAuthReady';
import Orders from './Orders';
import Permits from './Permits';
import Refunds from './Refunds';

vi.mock('../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../api/useUserRole')>()),
  default: vi.fn(),
}));
vi.mock('../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: vi.fn(),
}));

const ROLES_ABOVE_INSPECTORS = [
  UserRole.PREPARATORS,
  UserRole.CUSTOMER_SERVICE,
  UserRole.SANCTIONS,
  UserRole.SANCTIONS_AND_REFUNDS,
  UserRole.SUPER_ADMIN,
];

// Records the GraphQL operations sent and never answers them.
let sentQueries: string[] = [];
const createClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(operation => {
      sentQueries.push(print(operation.query));
      return new Observable(() => undefined);
    }),
  });

const renderPage = (path: string, page: React.ReactElement) =>
  render(
    <ApolloProvider client={createClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={page} />
          <Route path="/permits" element={<div>Permits redirect target</div>} />
        </Routes>
      </MemoryRouter>
    </ApolloProvider>
  );

beforeEach(() => {
  sentQueries = [];
  vi.mocked(useIsAuthorizationReady).mockReturnValue([true, false, true, true]);
});

afterEach(() => {
  vi.resetAllMocks();
});

const searchPermits = (role: UserRole) => {
  vi.mocked(useUserRole).mockReturnValue(role);
  renderPage('/permits', <Permits />);
  fireEvent.click(
    screen.getByText('components.permits.permitsSearch.searchButton')
  );
};

describe('Permits page', () => {
  it('uses the limited permits query for inspectors', () => {
    searchPermits(UserRole.INSPECTORS);

    expect(sentQueries.join()).toContain('limitedPermits');
  });

  it.each(ROLES_ABOVE_INSPECTORS)(
    'uses the full permits query for role %s',
    role => {
      searchPermits(role);

      expect(sentQueries).not.toHaveLength(0);
      expect(sentQueries.join()).not.toContain('limitedPermits');
    }
  );
});

describe.each([
  ['/orders', <Orders key="orders" />, 'pages.orders.title'],
  ['/refunds', <Refunds key="refunds" />, 'pages.refunds.title'],
])('%s page access', (path, page, heading) => {
  it('redirects inspectors to permits', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.INSPECTORS);
    renderPage(path, page);

    expect(screen.getByText('Permits redirect target')).toBeInTheDocument();
  });

  it.each(ROLES_ABOVE_INSPECTORS)('stays on the page for role %s', role => {
    vi.mocked(useUserRole).mockReturnValue(role);
    renderPage(path, page);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(
      screen.queryByText('Permits redirect target')
    ).not.toBeInTheDocument();
  });
});
