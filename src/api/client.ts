import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import i18n from '../i18n';
import { getEnv } from '../utils';

function getApiClient(token: string): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: `${getEnv('REACT_APP_PARKING_PERMITS_BACKEND_URL')}/admin-graphql/`,
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Accept-Language': i18n.language,
      'Content-Language': i18n.language,
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export default getApiClient;
