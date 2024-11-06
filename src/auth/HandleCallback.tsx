import * as Sentry from '@sentry/react';
import {
  LoginCallbackHandler,
  OidcClientError,
  useApiTokensClient,
  useOidcClient,
  User,
} from 'hds-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isCallbackUrl } from './index';

const HandleCallback = (
  props: React.PropsWithChildren<unknown>
): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useOidcClient();
  const { fetch } = useApiTokensClient();
  const { children } = props;
  const isCallback = isCallbackUrl(location.pathname);

  const onSuccess = (user: User) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tokens = fetch(user);
    navigate('/permits', { replace: true });
  };

  const onError = (error: OidcClientError | undefined) => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!error) {
      return;
    }
    if (
      error.isSignInError &&
      error.message ===
        'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback'
    ) {
      // This is HDS issue, should be ignored
      return;
    }
    Sentry.captureException(error);
    navigate('/authError', { replace: true });
  };

  if (!isAuthenticated() && isCallback) {
    return (
      <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
        <div>Logging in...</div>
      </LoginCallbackHandler>
    );
  }
  return <>{children}</>;
};

export default HandleCallback;
