import { renderHook } from '@testing-library/react';
import type { CookieConsentChangeEvent } from 'hds-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useCookieConsentSettings, {
  COOKIE_CONSENT_GROUP,
} from './useCookieConsentSettings';

const mocks = vi.hoisted(() => ({
  language: 'sv',
}));

const fireChange = (
  handler: ((event: CookieConsentChangeEvent) => void) | undefined,
  acceptedGroups: string[]
) => {
  if (!handler) {
    throw new Error('Expected a cookie consent change handler');
  }
  handler({ type: 'change', acceptedGroups });
};

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ i18n: { language: mocks.language } }),
}));

/* eslint-disable no-underscore-dangle */
const originalPaq = window._paq;

afterEach(() => {
  window._paq = originalPaq;
  mocks.language = 'sv';
});

const renderSettings = (siteName = 'Parking permits') =>
  renderHook(
    ({ currentSiteName }) =>
      useCookieConsentSettings({ siteName: currentSiteName }),
    { initialProps: { currentSiteName: siteName } }
  );

describe('useCookieConsentSettings', () => {
  it('uses the given site name and current language', () => {
    const { result, rerender } = renderSettings();

    expect(result.current.siteSettings.siteName).toBe('Parking permits');
    expect(result.current.siteSettings.cookieName).toBe(
      'helfi-cookie-consents'
    );
    expect(result.current.options).toEqual({
      focusTargetSelector: '#parking-permit-admin-app',
      language: 'sv',
    });

    mocks.language = 'fi';
    rerender({ currentSiteName: 'Updated site name' });

    expect(result.current.siteSettings.siteName).toBe('Updated site name');
    expect(result.current.options?.language).toBe('fi');
  });

  it('does nothing when Matomo is not initialized', () => {
    window._paq = undefined;
    const { result } = renderSettings();

    expect(() =>
      fireChange(result.current.onChange, [COOKIE_CONSENT_GROUP.Statistics])
    ).not.toThrow();
  });

  it('grants Matomo consent when statistics are accepted', () => {
    window._paq = [];
    const { result } = renderSettings();

    fireChange(result.current.onChange, [COOKIE_CONSENT_GROUP.Statistics]);

    expect(window._paq).toEqual([
      ['setConsentGiven'],
      ['setCookieConsentGiven'],
    ]);
  });

  it('revokes Matomo consent when statistics are not accepted', () => {
    window._paq = [];
    const { result } = renderSettings();

    fireChange(result.current.onChange, [COOKIE_CONSENT_GROUP.Shared]);

    expect(window._paq).toEqual([['forgetConsentGiven']]);
  });
});
/* eslint-enable no-underscore-dangle */
