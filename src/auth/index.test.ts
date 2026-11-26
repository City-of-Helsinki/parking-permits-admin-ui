import {
  getHDSClientConfig,
  getLocationBasedUri,
  isCallbackUrl,
} from './index';

const envValues = vi.hoisted(
  (): Record<string, string> => ({
    REACT_APP_OIDC_URL: 'https://oidc.example.test',
    REACT_APP_OIDC_REALM: 'test-realm',
    REACT_APP_OIDC_CLIENT_ID: 'test-client',
    REACT_APP_OIDC_SCOPE: 'openid profile email',
    REACT_APP_OIDC_CALLBACK_PATH: '/test-callback/',
    REACT_APP_OIDC_SILENT_AUTH_PATH: '/silent-renew',
    REACT_APP_OIDC_RESPONSE_TYPE: 'code',
    REACT_APP_OIDC_LOGOUT_PATH: '/logout',
    REACT_APP_OIDC_TOKEN_EXCHANGE_PATH: '/token',
    REACT_APP_TOKEN_KEY: 'parking-api',
    REACT_APP_PROFILE_TOKEN_KEY: 'profile-api',
  })
);
const origin = window.location.origin;
const callbackPath = envValues.REACT_APP_OIDC_CALLBACK_PATH;
const oidcAuthority = `${envValues.REACT_APP_OIDC_URL}/auth/realms/${envValues.REACT_APP_OIDC_REALM}`;

vi.mock('../utils', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils')>()),
  getEnvValue: (key: string) => envValues[key],
}));

describe('auth configuration', () => {
  it('builds redirect URIs from the current origin', () => {
    expect(getLocationBasedUri(callbackPath)).toBe(`${origin}${callbackPath}`);
    expect(getLocationBasedUri(undefined)).toBeUndefined();
  });

  it('matches only the configured OIDC callback path', () => {
    expect(isCallbackUrl(callbackPath)).toBe(true);
    expect(isCallbackUrl('/test-callback')).toBe(false);
    expect(isCallbackUrl('/other')).toBe(false);
  });

  it('builds the HDS login and token client configuration from runtime values', () => {
    const config = getHDSClientConfig();

    expect(config.userManagerSettings).toMatchObject({
      authority: oidcAuthority,
      client_id: envValues.REACT_APP_OIDC_CLIENT_ID,
      scope: envValues.REACT_APP_OIDC_SCOPE,
      redirect_uri: `${origin}${callbackPath}`,
      silent_redirect_uri: `${origin}${envValues.REACT_APP_OIDC_SILENT_AUTH_PATH}`,
      automaticSilentRenew: true,
      response_type: envValues.REACT_APP_OIDC_RESPONSE_TYPE,
      post_logout_redirect_uri: `${origin}${envValues.REACT_APP_OIDC_LOGOUT_PATH}`,
    });
    expect(config.apiTokensClientSettings).toMatchObject({
      url: `${oidcAuthority}${envValues.REACT_APP_OIDC_TOKEN_EXCHANGE_PATH}`,
      queryProps: {
        grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        permission: '#access',
      },
      audiences: [
        envValues.REACT_APP_TOKEN_KEY,
        envValues.REACT_APP_PROFILE_TOKEN_KEY,
      ],
      maxRetries: 10,
      retryInterval: 1000,
    });
    expect(config.sessionPollerSettings).toEqual({ pollIntervalInMs: 10000 });
  });
});
