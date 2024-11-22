import { LoginProviderProps } from 'hds-react';
import { getEnv } from '../utils';

export function getLocationBasedUri(
  property: string | undefined
): string | undefined {
  const location = window.location.origin;
  if (property === undefined) {
    return undefined;
  }
  return `${location}${property}`;
}

const HDSLoginConfig: LoginProviderProps = {
  userManagerSettings: {
    authority: `${getEnv('REACT_APP_OIDC_URL')}/auth/realms/${getEnv(
      'REACT_APP_OIDC_REALM'
    )}`,
    client_id: getEnv('REACT_APP_OIDC_CLIENT_ID'),
    scope: getEnv('REACT_APP_OIDC_SCOPE'),
    redirect_uri: getLocationBasedUri(getEnv('REACT_APP_OIDC_CALLBACK_PATH')),
    silent_redirect_uri: getLocationBasedUri(
      getEnv('REACT_APP_OIDC_SILENT_AUTH_PATH')
    ),
    automaticSilentRenew: true,
    response_type: getEnv('REACT_APP_OIDC_RESPONSE_TYPE'),
    post_logout_redirect_uri: getLocationBasedUri(
      getEnv('REACT_APP_OIDC_LOGOUT_PATH')
    ),
  },
  apiTokensClientSettings: {
    url: `${getEnv('REACT_APP_OIDC_URL')}/auth/realms/${getEnv(
      'REACT_APP_OIDC_REALM'
    )}${getEnv('REACT_APP_OIDC_TOKEN_EXCHANGE_PATH')}`,
    queryProps: {
      grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      permission: '#access',
    },
    audiences: [
      getEnv('REACT_APP_TOKEN_KEY'),
      getEnv('REACT_APP_PROFILE_TOKEN_KEY'),
    ],
    maxRetries: 10,
    retryInterval: 1000,
  },
  sessionPollerSettings: {
    pollIntervalInMs: 10000,
  },
};

export function getHDSClientConfig(): LoginProviderProps {
  return HDSLoginConfig;
}

export function isCallbackUrl(url: string): boolean {
  return url === getEnv('REACT_APP_OIDC_CALLBACK_PATH');
}
