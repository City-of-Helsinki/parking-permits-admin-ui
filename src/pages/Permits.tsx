import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { makePrivate } from '../auth/utils';
import PermitsDataTable from '../components/permits/PermitsDataTable';
import PermitsSearch from '../components/permits/PermitsSearch';
import {
  DEFAULT_SEARCH_INFO,
  getSearchItems,
} from '../components/permits/utils';
import {
  OrderBy,
  PermitsQueryData,
  PermitsQueryVariables,
  PermitsSearchInfo,
} from '../types';

const PERMITS_QUERY = gql`
  query GetPermits(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchItems: [SearchItem]
  ) {
    permits(
      pageInput: $pageInput
      orderBy: $orderBy
      searchItems: $searchItems
    ) {
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
  const [searchInfo, setSearchInfo] =
    useState<PermitsSearchInfo>(DEFAULT_SEARCH_INFO);
  const searchItems = getSearchItems(searchInfo);
  const variables: PermitsQueryVariables = {
    pageInput: { page },
    orderBy,
    searchItems,
  };
  const { loading, error, data } = useQuery<PermitsQueryData>(PERMITS_QUERY, {
    variables,
  });
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return (
    <div>
      <PermitsSearch
        searchInfo={searchInfo}
        onSearch={newSearchInfo => setSearchInfo(newSearchInfo)}
      />
      <PermitsDataTable
        permits={data?.permits.objects || []}
        pageInfo={data?.permits.pageInfo}
        loading={loading}
        orderBy={orderBy}
        onPage={newPage => setPage(newPage)}
        onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
      />
    </div>
  );
};

export default makePrivate(Permits);
