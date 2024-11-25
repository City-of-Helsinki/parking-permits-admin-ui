import { gql, useLazyQuery } from '@apollo/client';
import { Button, IconArrowRight, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import { makePrivate } from '../auth/utils';
import PermitsDataTable from '../components/permits/PermitsDataTable';
import PermitsSearch from '../components/permits/PermitsSearch';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { useOrderByParam, usePageParam } from '../hooks/searchParam';
import {
  LimitedPermitsQueryData,
  OrderBy,
  ParkingPermitStatusOrAll,
  Permit,
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
        primaryVehicle
        address {
          streetName
          streetNameSv
          streetNumber
          city
          citySv
          postalCode
        }
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
          primaryAddressApartment
          otherAddress {
            streetName
            streetNameSv
            streetNumber
            city
            citySv
            postalCode
          }
          otherAddressApartment
        }
        vehicle {
          manufacturer
          model
          registrationNumber
        }
        parkingZone {
          name
        }
        activeTemporaryVehicleRegistrationNumber
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

const LIMITED_PERMITS_QUERY = gql`
  query GetPermits(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: PermitSearchParamsInput
  ) {
    limitedPermits(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
      objects {
        id
        startTime
        endTime
        status
        vehicle {
          manufacturer
          model
          registrationNumber
        }
        parkingZone {
          name
        }
        activeTemporaryVehicleRegistrationNumber
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
  const userRole = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const exportData = useExportData();
  const statusParam = searchParams.get('status');
  const qParam = searchParams.get('q');

  const { pageParam: page, setPageParam } = usePageParam();
  const { orderByParam: orderBy, setOrderBy } = useOrderByParam();

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

  const [getPermits, { loading, data, refetch }] = useLazyQuery<
    PermitsQueryData | LimitedPermitsQueryData
  >(userRole > UserRole.INSPECTORS ? PERMITS_QUERY : LIMITED_PERMITS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });

  const handleSearch = (newSearchParams: PermitSearchParams) => {
    setSearchParams(
      new URLSearchParams({
        ...newSearchParams,
        ...orderBy,
        page: '1',
      }),
      { replace: true }
    );

    getPermits({
      variables: {
        searchParams: newSearchParams,
        pageInput: { page: 1 },
        orderBy,
      },
    });
  };

  const handlePage = (newPage: number) => {
    setPageParam(newPage);

    refetch({
      pageInput: { page: newPage },
    });
  };

  const handleOrderBy = (newOrderBy: OrderBy) => {
    setOrderBy(newOrderBy);

    refetch({
      orderBy: newOrderBy,
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

  const handleRowClick = (row: Permit) => {
    if (userRole > UserRole.INSPECTORS) {
      navigate(row.id);
    }
  };

  const extractDataFromPermitQuery = (
    queryData: LimitedPermitsQueryData | PermitsQueryData | undefined
  ) => {
    if (userRole > UserRole.INSPECTORS) {
      return (queryData as PermitsQueryData)?.permits;
    }
    return (queryData as LimitedPermitsQueryData)?.limitedPermits;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t(`${T_PATH}.title`)}</h2>
        {userRole > UserRole.PREPARATORS && (
          <Button
            iconLeft={<IconArrowRight />}
            onClick={() => navigate('create')}>
            {t(`${T_PATH}.createNewPermit`)}
          </Button>
        )}
      </div>
      <PermitsSearch
        searchParams={permitSearchParams}
        onSearch={handleSearch}
      />
      <PermitsDataTable
        permits={extractDataFromPermitQuery(data)?.objects}
        pageInfo={extractDataFromPermitQuery(data)?.pageInfo}
        loading={loading}
        orderBy={orderBy}
        onPage={handlePage}
        onOrderBy={handleOrderBy}
        onRowClick={handleRowClick}
        onExport={userRole > UserRole.INSPECTORS && handleExport}
      />
      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};

export default makePrivate(Permits);
