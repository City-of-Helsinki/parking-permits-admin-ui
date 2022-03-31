import { gql, useQuery } from '@apollo/client';
import { Button, IconArrowRight, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
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
import styles from './Permits.module.scss';

const T_PATH = 'pages.permits';

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
            city
            citySv
            postalCode
          }
          otherAddress {
            streetName
            streetNameSv
            streetNumber
            city
            citySv
            postalCode
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
        startIndex
        endIndex
        count
      }
    }
  }
`;

const Permits = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [errorMessage, setErrorMessage] = useState('');
  const searchItems = getSearchItems(searchInfo);
  const variables: PermitsQueryVariables = {
    pageInput: { page },
    orderBy,
    searchItems,
  };
  const { loading, data } = useQuery<PermitsQueryData>(PERMITS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
        <Button
          iconLeft={<IconArrowRight />}
          onClick={() => navigate('create')}>
          {t(`${T_PATH}.createNewPermit`)}
        </Button>
      </div>
      <PermitsSearch searchInfo={searchInfo} onSearch={handleSearch} />
      <PermitsDataTable
        permits={data?.permits.objects || []}
        pageInfo={data?.permits.pageInfo}
        loading={loading}
        orderBy={orderBy}
        onPage={handlePage}
        onOrderBy={handleOrderBy}
        onRowClick={row => navigate(row.identifier.toString())}
      />
      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};

export default makePrivate(Permits);
