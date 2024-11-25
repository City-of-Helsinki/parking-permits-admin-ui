import { gql, useQuery } from '@apollo/client';
import classNames from 'classnames';
import { Button, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../../../auth/utils';
import AddressesDataTable from '../../../components/superAdmin/addresses/AddressesDataTable';
import AddressesSearch from '../../../components/superAdmin/addresses/AddressesSearch';
import { useOrderByParam, usePageParam } from '../../../hooks/searchParam';
import {
  AddressesQueryData,
  AddressSearchParams,
  OrderBy,
} from '../../../types';
import styles from './Addresses.module.scss';

const T_PATH = 'pages.superAdmin.addresses';

const ADDRESSES_QUERY = gql`
  query GetAddresses(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: AddressSearchParamsInput
  ) {
    addresses(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
      objects {
        id
        streetName
        streetNameSv
        streetNumber
        postalCode
        city
        citySv
        zone {
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

const Addresses = (): React.ReactElement => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const { pageParam, setPageParam } = usePageParam();
  const { orderByParam: orderBy, setOrderBy } = useOrderByParam();

  const initialSearchParams = {
    streetName: searchParams.get('streetName') || '',
    streetNumber: searchParams.get('streetNumber') || '',
    postalCode: searchParams.get('postalCode') || '',
    parkingZone: searchParams.get('parkingZone') || '',
  };

  const variables = {
    pageInput: { page: pageParam },
    orderBy,
  };

  const { loading, data, refetch } = useQuery<AddressesQueryData>(
    ADDRESSES_QUERY,
    {
      variables,
      fetchPolicy: 'no-cache',
      onError: error => setErrorMessage(error.message),
    }
  );

  const handleSearch = (newSearchParams: AddressSearchParams) => {
    setSearchParams(
      new URLSearchParams({
        ...newSearchParams,
        ...orderBy,
        page: '1',
      }),
      { replace: true }
    );

    refetch({
      searchParams: newSearchParams,
      pageInput: { page: 1 },
      orderBy,
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={classNames(styles.title, 'heading-l')}>
          {t(`${T_PATH}.title`)}
        </h2>
        <div className={styles.actions}>
          <Button onClick={() => navigate('create')} variant="secondary">
            {t(`${T_PATH}.addNewAddress`)}
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <AddressesSearch
          onSearch={handleSearch}
          searchParams={initialSearchParams}
        />
        <AddressesDataTable
          addresses={data?.addresses.objects || []}
          pageInfo={data?.addresses.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={handlePage}
          onOrderBy={handleOrderBy}
          onRowClick={address => navigate(address.id as string)}
        />
      </div>
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
export default makePrivate(Addresses);
