import { createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import {
  createApolloClientModule,
  LoginProvider as HDSLoginProvider,
} from 'hds-react';
import React, { FC, useMemo } from 'react';
import { getHDSClientConfig } from '.';
import i18n from '../i18n';
import { getEnvValue } from '../utils';

interface LoginProviderProps {
  children: React.ReactNode;
}

const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const loginProviderProps = getHDSClientConfig();

  const apolloClientModule = useMemo(() => {
    const httpLink = createHttpLink({
      uri: `${getEnvValue(
        'REACT_APP_PARKING_PERMITS_BACKEND_URL'
      )}/admin-graphql/`,
    });

    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        'Accept-Language': i18n.language,
        'Content-Language': i18n.language,
      },
    }));

    return createApolloClientModule({
      tokenSetter: (headers, tokens) => {
        const apiToken =
          tokens[getEnvValue('REACT_APP_PARKING_PERMITS_AUDIENCE') || ''];
        return {
          authorization: apiToken ? `Bearer ${apiToken}` : '',
        };
      },
      clientOptions: {
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
      },
    });
  }, []);

  return (
    <HDSLoginProvider {...loginProviderProps} modules={[apolloClientModule]}>
      {children}
    </HDSLoginProvider>
  );
};

export default LoginProvider;
