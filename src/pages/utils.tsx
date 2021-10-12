import React, { useContext } from 'react';
import { Navigate } from 'react-router';
import { ApiAccessTokenContext } from '../auth/ApiAccessTokenProvider';
import { ApiAccessTokenActions, useClient } from '../auth/hooks';

// eslint-disable-next-line import/prefer-default-export
export function makePrivate<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function PrivateComponent(props: T) {
    const client = useClient();
    const { getStatus } = useContext(
      ApiAccessTokenContext
    ) as ApiAccessTokenActions;
    const apiStatus = getStatus();
    if (!client.isInitialized()) {
      return <div>Initializing...</div>;
    }
    if (!client.isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    if (apiStatus !== 'loaded') {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}
