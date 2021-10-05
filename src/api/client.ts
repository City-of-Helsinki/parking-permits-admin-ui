import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getEnv } from '../utils';

function getApiClient(token: string): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: getEnv('REACT_APP_PARKING_PERMIT_ADMIN_API'),
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export default getApiClient;
