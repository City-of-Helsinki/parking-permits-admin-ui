import React from 'react';
import { Navigate } from 'react-router';
import { useClient } from '../auth/hooks';

// eslint-disable-next-line import/prefer-default-export
export function makePrivate<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function PrivateComponent(props: T) {
    const client = useClient();
    if (!client.isInitialized()) {
      return <div>Initializing...</div>;
    }
    if (!client.isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return <Component {...props} />;
  };
}
