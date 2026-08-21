import { renderHook } from '@testing-library/react';
import { useAuthenticatedUser } from 'hds-react';
import useUserRole, { Groups, UserRole } from './useUserRole';

jest.mock('hds-react', () => ({
  useAuthenticatedUser: jest.fn(),
}));

const mockUseAuthenticatedUser = useAuthenticatedUser as jest.Mock;

// Encodes a value as a base64url JWT segment. Decoding never verifies the
// signature, so an unsigned ("alg: none") token is enough for these tests.
// Uses btoa (available in the jsdom test environment) to avoid a Node-only
// Buffer dependency in these browser-oriented tests.
const toBase64UrlSegment = (value: unknown): string =>
  btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const makeToken = (payload: Record<string, unknown>): string => {
  const header = toBase64UrlSegment({ alg: 'none', typ: 'JWT' });
  const body = toBase64UrlSegment(payload);
  return `${header}.${body}.signature`;
};

const setAuthenticatedUser = (user: unknown): void => {
  mockUseAuthenticatedUser.mockReturnValue(user);
};

const setAuthenticatedUserWithGroups = (adGroups: string[]): void => {
  setAuthenticatedUser({ id_token: makeToken({ ad_groups: adGroups }) });
};

const renderUserRole = (): UserRole =>
  renderHook(() => useUserRole()).result.current;

afterEach(() => {
  jest.resetAllMocks();
});

describe('useUserRole', () => {
  describe('when there is no decodable token', () => {
    it('returns UNKNOWN when there is no authenticated user', () => {
      setAuthenticatedUser(undefined);
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });

    it('returns UNKNOWN when the user has no id_token', () => {
      setAuthenticatedUser({ id_token: undefined });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });

    // Locks in the pre-migration behavior: jsonwebtoken.decode() returned null
    // for a malformed token, so the hook must continue to resolve to UNKNOWN
    // even though jwtDecode() throws.
    it('returns UNKNOWN for a malformed id_token', () => {
      setAuthenticatedUser({ id_token: 'not-a-jwt' });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });
  });

  describe('role mapping from ad_groups', () => {
    it('maps the super admin group to SUPER_ADMIN', () => {
      setAuthenticatedUserWithGroups([Groups.SUPER_ADMIN]);
      expect(renderUserRole()).toBe(UserRole.SUPER_ADMIN);
    });

    it('maps the sanctions and refunds group to SANCTIONS_AND_REFUNDS', () => {
      setAuthenticatedUserWithGroups([Groups.SANCTIONS_AND_REFUNDS]);
      expect(renderUserRole()).toBe(UserRole.SANCTIONS_AND_REFUNDS);
    });

    it('maps the sanctions group to SANCTIONS', () => {
      setAuthenticatedUserWithGroups([Groups.SANCTIONS]);
      expect(renderUserRole()).toBe(UserRole.SANCTIONS);
    });

    it('maps the customer service group to CUSTOMER_SERVICE', () => {
      setAuthenticatedUserWithGroups([Groups.CUSTOMER_SERVICE]);
      expect(renderUserRole()).toBe(UserRole.CUSTOMER_SERVICE);
    });

    it('maps the preparators group to PREPARATORS', () => {
      setAuthenticatedUserWithGroups([Groups.PREPARATORS]);
      expect(renderUserRole()).toBe(UserRole.PREPARATORS);
    });

    it('maps the inspectors group to INSPECTORS', () => {
      setAuthenticatedUserWithGroups([Groups.INSPECTORS]);
      expect(renderUserRole()).toBe(UserRole.INSPECTORS);
    });

    it('strips the "helsinki1\\" ADFS prefix before matching', () => {
      setAuthenticatedUserWithGroups([`helsinki1\\${Groups.INSPECTORS}`]);
      expect(renderUserRole()).toBe(UserRole.INSPECTORS);
    });

    it('matches groups case-insensitively', () => {
      setAuthenticatedUserWithGroups([Groups.INSPECTORS.toUpperCase()]);
      expect(renderUserRole()).toBe(UserRole.INSPECTORS);
    });
  });

  describe('precedence between multiple groups', () => {
    it('returns the highest-privilege role regardless of array order', () => {
      setAuthenticatedUserWithGroups([Groups.INSPECTORS, Groups.SUPER_ADMIN]);
      expect(renderUserRole()).toBe(UserRole.SUPER_ADMIN);
    });
  });

  describe('token without a recognized group', () => {
    it('returns NON_AD_GROUPS when no ad_group matches a known role', () => {
      setAuthenticatedUserWithGroups(['some_unrelated_group']);
      expect(renderUserRole()).toBe(UserRole.NON_AD_GROUPS);
    });

    it('returns NON_AD_GROUPS for an empty ad_groups array', () => {
      setAuthenticatedUserWithGroups([]);
      expect(renderUserRole()).toBe(UserRole.NON_AD_GROUPS);
    });
  });

  describe('token payload with an invalid ad_groups claim', () => {
    it('returns UNKNOWN when the ad_groups claim is missing', () => {
      setAuthenticatedUser({ id_token: makeToken({}) });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });

    it('returns UNKNOWN when the ad_groups claim is null', () => {
      setAuthenticatedUser({ id_token: makeToken({ ad_groups: null }) });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });

    it('returns UNKNOWN when the ad_groups claim is not an array', () => {
      setAuthenticatedUser({
        id_token: makeToken({ ad_groups: 'sg_kymp_pyva_asukpt_yllapito' }),
      });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });

    it('returns UNKNOWN when ad_groups contains non-string entries', () => {
      setAuthenticatedUser({
        id_token: makeToken({ ad_groups: [true, null] }),
      });
      expect(renderUserRole()).toBe(UserRole.UNKNOWN);
    });
  });
});
