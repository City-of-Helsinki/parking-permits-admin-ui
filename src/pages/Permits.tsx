import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { makePrivate } from './utils';

const PERMITS_QUERY = gql`
  query GetPermits($pageInput: PageInput!) {
    permits(pageInput: $pageInput) {
      objects {
        customer {
          firstName
          lastName
        }
      }
      pageInfo {
        numPages
        next
        prev
      }
    }
  }
`;

const Permits = (): React.ReactElement => {
  const { loading, error, data } = useQuery(PERMITS_QUERY, {
    variables: { pageInput: { page: 1 } },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return <div>{JSON.stringify(data)}</div>;
};
export default makePrivate(Permits);
