import { InMemoryCache } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthenticatedUser } from 'hds-react';
import { ReactNode } from 'react';
import useUserRole, {
  CURRENT_USER_GROUPS,
  Groups,
  UserRole,
  UserRoleProvider,
} from './useUserRole';

vi.mock('hds-react', () => ({
  useAuthenticatedUser: vi.fn(),
}));

const setUser = (subject: string | undefined) => {
  vi.mocked(useAuthenticatedUser).mockReturnValue(
    subject
      ? ({ profile: { sub: subject } } as ReturnType<
          typeof useAuthenticatedUser
        >)
      : null
  );
};

const groupsMock = (groups: string[]): MockedResponse => ({
  request: { query: CURRENT_USER_GROUPS },
  result: { data: { currentUserGroups: groups } },
});

const renderUserRole = (
  mocks: MockedResponse[] = [],
  cache = new InMemoryCache()
) =>
  renderHook(() => useUserRole(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} cache={cache}>
        <UserRoleProvider>{children}</UserRoleProvider>
      </MockedProvider>
    ),
  });

beforeEach(() => {
  setUser('test-user');
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('useUserRole', () => {
  it('does not request groups for an unauthenticated user', () => {
    setUser(undefined);
    const { result } = renderUserRole();
    expect(result.current).toBe(UserRole.UNKNOWN);
  });

  it('returns LOADING until the backend groups arrive', async () => {
    const { result } = renderUserRole([groupsMock([Groups.INSPECTORS])]);
    expect(result.current).toBe(UserRole.LOADING);
    await waitFor(() => expect(result.current).toBe(UserRole.INSPECTORS));
  });

  it.each([
    [Groups.SUPER_ADMIN, UserRole.SUPER_ADMIN],
    [Groups.SANCTIONS_AND_REFUNDS, UserRole.SANCTIONS_AND_REFUNDS],
    [Groups.SANCTIONS, UserRole.SANCTIONS],
    [Groups.CUSTOMER_SERVICE, UserRole.CUSTOMER_SERVICE],
    [Groups.PREPARATORS, UserRole.PREPARATORS],
    [Groups.INSPECTORS, UserRole.INSPECTORS],
  ])('maps backend group %s to role %s', async (group, role) => {
    const { result } = renderUserRole([groupsMock([group])]);
    await waitFor(() => expect(result.current).toBe(role));
  });

  it('has strictly descending role values from the highest group down', () => {
    const roles = [
      UserRole.SUPER_ADMIN,
      UserRole.SANCTIONS_AND_REFUNDS,
      UserRole.SANCTIONS,
      UserRole.CUSTOMER_SERVICE,
      UserRole.PREPARATORS,
      UserRole.INSPECTORS,
      UserRole.NON_AD_GROUPS,
    ];
    expect([...roles].sort((a, b) => b - a)).toEqual(roles);
    expect(new Set(roles).size).toBe(roles.length);
  });

  it.each([
    [Groups.SUPER_ADMIN, UserRole.SUPER_ADMIN, Groups.SANCTIONS_AND_REFUNDS],
    [
      Groups.SANCTIONS_AND_REFUNDS,
      UserRole.SANCTIONS_AND_REFUNDS,
      Groups.SANCTIONS,
    ],
    [Groups.SANCTIONS, UserRole.SANCTIONS, Groups.CUSTOMER_SERVICE],
    [Groups.CUSTOMER_SERVICE, UserRole.CUSTOMER_SERVICE, Groups.PREPARATORS],
    [Groups.PREPARATORS, UserRole.PREPARATORS, Groups.INSPECTORS],
  ])(
    'selects %s over the group right below it in either order',
    async (higher, higherRole, lower) => {
      for (const groups of [
        [higher, lower],
        [lower, higher],
      ]) {
        const { result, unmount } = renderUserRole([groupsMock(groups)]);
        await waitFor(() => expect(result.current).toBe(higherRole));
        unmount();
      }
    }
  );

  it.each([{ groups: [] }, { groups: ['unrelated_group'] }])(
    'returns NON_AD_GROUPS for $groups',
    async ({ groups }) => {
      const { result } = renderUserRole([groupsMock(groups)]);
      await waitFor(() => expect(result.current).toBe(UserRole.NON_AD_GROUPS));
    }
  );

  it('returns ERROR on a failed request without trusting the ID token', async () => {
    vi.mocked(useAuthenticatedUser).mockReturnValue({
      profile: { sub: 'test-user' },
      id_token: 'an-old-token',
    } as ReturnType<typeof useAuthenticatedUser>);
    const { result } = renderUserRole([
      {
        request: { query: CURRENT_USER_GROUPS },
        error: new Error('Unavailable'),
      },
    ]);
    await waitFor(() => expect(result.current).toBe(UserRole.ERROR));
  });

  it('does not reuse cached groups', async () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: CURRENT_USER_GROUPS,
      data: { currentUserGroups: [Groups.SUPER_ADMIN] },
    });
    const { result } = renderUserRole([groupsMock([Groups.INSPECTORS])], cache);
    expect(result.current).toBe(UserRole.LOADING);
    await waitFor(() => expect(result.current).toBe(UserRole.INSPECTORS));
  });

  it('reloads groups when the authenticated account changes', async () => {
    const { result, rerender } = renderUserRole([
      groupsMock([Groups.SUPER_ADMIN]),
      groupsMock([Groups.INSPECTORS]),
    ]);
    await waitFor(() => expect(result.current).toBe(UserRole.SUPER_ADMIN));
    setUser('another-user');
    rerender();
    expect(result.current).toBe(UserRole.LOADING);
    await waitFor(() => expect(result.current).toBe(UserRole.INSPECTORS));
  });

  it('does not use an in-flight response from the previous account', async () => {
    const { result, rerender } = renderUserRole([
      { ...groupsMock([Groups.SUPER_ADMIN]), delay: 100 },
      groupsMock([Groups.INSPECTORS]),
    ]);
    expect(result.current).toBe(UserRole.LOADING);

    setUser('another-user');
    rerender();

    await waitFor(() => expect(result.current).toBe(UserRole.INSPECTORS));
  });

  it('clears the role on logout', async () => {
    const { result, rerender } = renderUserRole([
      groupsMock([Groups.SUPER_ADMIN]),
    ]);
    await waitFor(() => expect(result.current).toBe(UserRole.SUPER_ADMIN));
    setUser(undefined);
    rerender();
    expect(result.current).toBe(UserRole.UNKNOWN);
  });
});
