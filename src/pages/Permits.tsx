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
  SavedStatus,
} from '../types';
import { getSavedStatus, saveStatus } from '../utils';

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
  const initialPage = getSavedStatus<number>(SavedStatus.PERMITS_PAGE) || 1;
  const initialOrderBy =
    getSavedStatus<OrderBy>(SavedStatus.PERMITS_ORDER_BY) || undefined;
  const initialSearchInfo =
    getSavedStatus<PermitsSearchInfo>(SavedStatus.PERMITS_SEARCH_INFO) ||
    DEFAULT_SEARCH_INFO;
  const [page, setPage] = useState(initialPage);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>(initialOrderBy);
  const [searchInfo, setSearchInfo] =
    useState<PermitsSearchInfo>(initialSearchInfo);
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
  const handleSearch = (newSearchInfo: PermitsSearchInfo) => {
    setSearchInfo(newSearchInfo);
    saveStatus(SavedStatus.PERMITS_SEARCH_INFO, newSearchInfo);
  };
  const handlePage = (newPage: number) => {
    setPage(newPage);
    saveStatus(SavedStatus.PERMITS_PAGE, newPage);
  };
  const handleOrderBy = (newOrderBy: OrderBy) => {
    setOrderBy(newOrderBy);
    saveStatus(SavedStatus.PERMITS_ORDER_BY, newOrderBy);
  };
  return (
    <div>
      <PermitsSearch searchInfo={searchInfo} onSearch={handleSearch} />
      <PermitsDataTable
        permits={data?.permits.objects || []}
        pageInfo={data?.permits.pageInfo}
        loading={loading}
        orderBy={orderBy}
        onPage={handlePage}
        onOrderBy={handleOrderBy}
      />
    </div>
  );
};

export default makePrivate(Permits);
