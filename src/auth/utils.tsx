import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { useIsAuthorizationReady } from './useIsAuthReady';

const T_PATH = 'components.common.utils';

// eslint-disable-next-line import/prefer-default-export
export function makePrivate<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function PrivateComponent(props: T) {
    const { t } = useTranslation();
    const [isReady, loading, isAuthenticated] = useIsAuthorizationReady();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (!isReady && loading) {
      return <div>{t(`${T_PATH}.loading`)}</div>;
    }
    return <Component {...props} />;
  };
}
