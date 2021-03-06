import { gql, useQuery } from '@apollo/client';
import { Button, IconArrowRight, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import PermitsDataTable from '../components/permits/PermitsDataTable';
import PermitsSearch from '../components/permits/PermitsSearch';
import { OrderDirection } from '../components/types';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import {
  OrderBy,
  ParkingPermitStatusOrAll,
  PermitSearchParams,
  PermitsQueryData,
  PermitsQueryVariables,
} from '../types';
import styles from './Permits.module.scss';

const T_PATH = 'pages.permits';

const PERMITS_QUERY = gql`
  query GetPermits(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: PermitSearchParamsInput
  ) {
    permits(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
      objects {
        id
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
  const [searchParams, setSearchParams] = useSearchParams();
  const exportData = useExportData();
  const pageParam = searchParams.get('page');
  const orderFieldParam = searchParams.get('orderField');
  const orderDirectionParam = searchParams.get('orderDirection');
  const statusParam = searchParams.get('status');
  const qParam = searchParams.get('q');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const orderBy = {
    orderField: orderFieldParam || '',
    orderDirection:
      (orderDirectionParam as OrderDirection) || OrderDirection.DESC,
  };
  const permitSearchParams = {
    status: (statusParam as ParkingPermitStatusOrAll | null) || 'ALL',
    q: qParam || '',
  };
  const [errorMessage, setErrorMessage] = useState('');
  const variables: PermitsQueryVariables = {
    pageInput: { page },
    orderBy,
    searchParams: permitSearchParams,
  };
  const { loading, data, refetch } = useQuery<PermitsQueryData>(PERMITS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  const handleSearch = (newPermitSearchParams: PermitSearchParams) => {
    const urlSearchParams = {
      ...newPermitSearchParams,
      ...orderBy,
      page,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { page },
      orderBy,
      searchParams: newPermitSearchParams,
    });
  };
  const handlePage = (newPage: number) => {
    const urlSearchParams = {
      ...permitSearchParams,
      ...orderBy,
      page: newPage,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { newPage },
      orderBy,
      searchParams: permitSearchParams,
    });
  };
  const handleOrderBy = (newOrderBy: OrderBy) => {
    const urlSearchParams = {
      ...permitSearchParams,
      ...newOrderBy,
      page,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { page },
      orderBy: newOrderBy,
      searchParams: permitSearchParams,
    });
  };
  const handleExport = () => {
    const url = formatExportUrl('permits', {
      ...permitSearchParams,
      ...orderBy,
      page: page.toString(),
    });
    exportData(url);
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
      <PermitsSearch
        searchParams={permitSearchParams}
        onSearch={handleSearch}
      />
      <PermitsDataTable
        permits={data?.permits.objects || []}
        pageInfo={data?.permits.pageInfo}
        loading={loading}
        orderBy={orderBy}
        onPage={handlePage}
        onOrderBy={handleOrderBy}
        onRowClick={row => navigate(row.id)}
        onExport={handleExport}
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
