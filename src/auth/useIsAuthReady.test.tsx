import { renderHook } from '@testing-library/react';
import { useIsAuthorizationReady } from './useIsAuthReady';

const mocks = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getTokens: vi.fn(),
  isSessionRenewing: vi.fn(),
  isApiTokenRenewing: vi.fn(),
  trackApiTokens: vi.fn(),
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({
    isAuthenticated: mocks.isAuthenticated,
    isRenewing: mocks.isSessionRenewing,
  }),
  useApiTokensClient: () => ({
    getTokens: mocks.getTokens,
    isRenewing: mocks.isApiTokenRenewing,
  }),
  useApiTokensClientTracking: mocks.trackApiTokens,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.isAuthenticated.mockReturnValue(false);
  mocks.getTokens.mockReturnValue(undefined);
  mocks.isSessionRenewing.mockReturnValue(false);
  mocks.isApiTokenRenewing.mockReturnValue(false);
});

describe('useIsAuthorizationReady', () => {
  it('combines authentication and token availability and remembers fetched tokens', () => {
    const { result, rerender } = renderHook(() => useIsAuthorizationReady());

    expect(result.current).toEqual([false, false, false, false]);

    mocks.getTokens.mockReturnValue({ accessToken: 'test-token' });
    rerender();
    expect(result.current).toEqual([false, false, false, true]);

    mocks.isAuthenticated.mockReturnValue(true);
    rerender();
    expect(result.current).toEqual([true, false, true, true]);

    mocks.getTokens.mockReturnValue(undefined);
    rerender();
    expect(result.current).toEqual([false, false, true, true]);
  });

  it.each([
    [true, false],
    [false, true],
    [true, true],
    [false, false],
  ])(
    'reports loading when session renewal is %s and token renewal is %s',
    (sessionRenewing, tokenRenewing) => {
      mocks.isSessionRenewing.mockReturnValue(sessionRenewing);
      mocks.isApiTokenRenewing.mockReturnValue(tokenRenewing);

      const { result } = renderHook(() => useIsAuthorizationReady());

      expect(result.current[1]).toBe(sessionRenewing || tokenRenewing);
    }
  );

  it('tracks API-token state on each render', () => {
    const { rerender } = renderHook(() => useIsAuthorizationReady());

    expect(mocks.trackApiTokens).toHaveBeenCalledTimes(1);

    rerender();
    expect(mocks.trackApiTokens).toHaveBeenCalledTimes(2);
  });
});
