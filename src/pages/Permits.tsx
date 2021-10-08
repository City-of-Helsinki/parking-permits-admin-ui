import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import PermitsDataTable from '../components/permits/PermitsDataTable';
import { PermitsQueryData } from '../types';
import { makePrivate } from './utils';

const PERMITS_QUERY = gql`
  query GetPermits($pageInput: PageInput!) {
    permits(pageInput: $pageInput) {
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
  const { loading, error, data } = useQuery<PermitsQueryData>(PERMITS_QUERY, {
    variables: { pageInput: { page } },
  });
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return (
    <PermitsDataTable
      permits={data?.permits.objects || []}
      pageInfo={data?.permits.pageInfo}
      loading={loading}
      onPage={newPage => setPage(newPage)}
      onOrderBy={() => {
        // do nothing yet
      }}
    />
  );
};

export default makePrivate(Permits);
