import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import PermitsDataTable from '../components/permits/PermitsDataTable';
import { OrderBy, PermitsQueryData, PermitsQueryVariables } from '../types';
import { makePrivate } from './utils';

const PERMITS_QUERY = gql`
  query GetPermits($pageInput: PageInput!, $orderBy: OrderByInput) {
    permits(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        identifier
        startTime
        endTime
        status
        customer {
          firstName
          lastName
          nationalIdNumber
          primaryAddress {
            streetName
            streetNameSv
            streetNumber
          }
        }
        vehicle {
          manufacturer
          model
          registrationNumber
        }
        parkingZone {
          name
        }
      }
      pageInfo {
        numPages
        page
        next
        prev
      }
    }
  }
`;

const Permits = (): React.ReactElement => {
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy>();
  const variables: PermitsQueryVariables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, error, data } = useQuery<PermitsQueryData>(PERMITS_QUERY, {
    variables,
  });
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return (
    <PermitsDataTable
      permits={data?.permits.objects || []}
      pageInfo={data?.permits.pageInfo}
      loading={loading}
      orderBy={orderBy}
      onPage={newPage => setPage(newPage)}
      onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
    />
  );
};

export default makePrivate(Permits);
