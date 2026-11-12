import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import { useApolloClient } from 'hds-react';
import React, { FC } from 'react';

export interface ApiClientContextProps {
  readonly client: ApolloClient<NormalizedCacheObject>;
}

export const ApiClientContext =
  React.createContext<ApiClientContextProps | null>(null);

interface Props {
  children: React.ReactNode;
}

export const ApiClientProvider: FC<Props> = ({ children }) => {
  const clientInLogin = useApolloClient();
  return <ApolloProvider client={clientInLogin}>{children}</ApolloProvider>;
};
