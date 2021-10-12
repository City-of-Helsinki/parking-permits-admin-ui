import React, { FC } from 'react';
import { ApiAccessTokenActions, useApiAccessTokens } from './hooks';

export interface ApiAccessTokenContextProps {
  readonly actions: ApiAccessTokenActions;
}

export const ApiAccessTokenContext =
  React.createContext<ApiAccessTokenActions | null>(null);

export const ApiAccessTokenProvider: FC<unknown> = ({ children }) => {
  const actions = useApiAccessTokens();
  return (
    <ApiAccessTokenContext.Provider value={actions}>
      {children}
    </ApiAccessTokenContext.Provider>
  );
};
