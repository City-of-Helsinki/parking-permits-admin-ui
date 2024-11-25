import { LoadingSpinner } from 'hds-react';
import React, { FC } from 'react';
import { useIsAuthorizationReady } from '../auth/useIsAuthReady';

export const ApiAccessTokenContext = React.createContext<null>(null);

interface Props {
  children: React.ReactNode;
}

export const ApiAccessTokenProvider: FC<Props> = ({ children }) => {
  const [isReady, loading, , gotTokensOnce] = useIsAuthorizationReady();

  if (!isReady && loading && !gotTokensOnce) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};
