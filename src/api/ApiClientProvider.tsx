import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import React, { FC, useContext } from 'react';
import { ApiAccessTokenContext } from '../auth/ApiAccessTokenProvider';
import { ApiAccessTokenActions } from '../auth/hooks';
import { getEnv } from '../utils';
import getApiClient from './client';

export interface ApiClientContextProps {
  readonly client: ApolloClient<NormalizedCacheObject>;
}

export const ApiClientContext =
  React.createContext<ApiClientContextProps | null>(null);

export const ApiClientProvider: FC<unknown> = ({ children }) => {
  const { getTokens } = useContext(
    ApiAccessTokenContext
  ) as ApiAccessTokenActions;
  const tokens = getTokens();
  const apiToken = tokens
    ? tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')]
    : '';
  const client = getApiClient(apiToken);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
