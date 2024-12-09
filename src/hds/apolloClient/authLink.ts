import { ApolloLink } from '@apollo/client/core';
import { TokenData } from 'hds-react';
import { TokenSetter } from '.';

// eslint-disable-next-line import/prefer-default-export
export function createAuthLink(
  tokenSetter: TokenSetter,
  tokenGetter: () => TokenData
): ApolloLink {
  return new ApolloLink((operation, forward) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    operation.setContext(({ headers }) => {
      const authHeaders = tokenSetter(headers, tokenGetter());
      return {
        headers: {
          ...headers,
          ...authHeaders,
        },
      };
    });
    return forward(operation);
  });
}
