import { createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { LoginProvider } from 'hds-react';
import React, { FC, useMemo } from 'react';
import { getHDSClientConfig } from '.';
import { TokenSetter } from '../hds/apolloClient';
import { createApolloClientModule } from '../hds/apolloClient/apolloClientModule';
import i18n from '../i18n';
import { getEnv } from '../utils';

interface HDSLoginProviderProps {
  children: React.ReactNode;
}

const HDSLoginProvider: FC<HDSLoginProviderProps> = ({ children }) => {
  const loginProviderProps = getHDSClientConfig();
  const apolloClientModule = useMemo(() => {
    const httpLink = createHttpLink({
      uri: `${getEnv('REACT_APP_PARKING_PERMITS_BACKEND_URL')}/admin-graphql/`,
    });

    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        'Accept-Language': i18n.language,
        'Content-Language': i18n.language,
      },
    }));

    const tokenSetter: TokenSetter = (headers, tokens) => {
      const apiToken = tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')];
      return {
        authorization: apiToken ? `Bearer ${apiToken}` : '',
      };
    };

    return createApolloClientModule({
      tokenSetter,
      clientOptions: {
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
      },
    });
  }, []);

  return (
    <LoginProvider {...loginProviderProps} modules={[apolloClientModule]}>
      {children}
    </LoginProvider>
  );
};

export default HDSLoginProvider;
