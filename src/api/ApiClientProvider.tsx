import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import { getApiTokensFromStorage, useApiTokensClientTracking } from 'hds-react';
import React, { FC } from 'react';
import { getEnv } from '../utils';
import getApiClient from './client';

export interface ApiClientContextProps {
  readonly client: ApolloClient<NormalizedCacheObject>;
}

export const ApiClientContext =
  React.createContext<ApiClientContextProps | null>(null);

interface Props {
  children: React.ReactNode;
}

export const ApiClientProvider: FC<Props> = ({ children }) => {
  useApiTokensClientTracking();
  const tokens = getApiTokensFromStorage();
  const apiToken = tokens
    ? tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')]
    : '';
  const client = getApiClient(apiToken);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
