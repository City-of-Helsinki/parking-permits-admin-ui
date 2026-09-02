import React from 'react';
import { Navigate } from 'react-router';
import { useIsAuthorizationReady } from './useIsAuthReady';

const makePrivate = <T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  const PrivateComponent = (props: T) => {
    const [, , isAuthenticated] = useIsAuthorizationReady();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <Component {...props} />;
  };
  PrivateComponent.displayName = 'PrivateComponent';
  return PrivateComponent;
};

export default makePrivate;
