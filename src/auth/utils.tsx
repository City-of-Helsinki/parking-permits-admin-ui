import React from 'react';
import { Navigate } from 'react-router';
import { useIsAuthorizationReady } from './useIsAuthReady';

// eslint-disable-next-line import/prefer-default-export
export function makePrivate<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function PrivateComponent(props: T) {
    const [, , isAuthenticated] = useIsAuthorizationReady();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
}
