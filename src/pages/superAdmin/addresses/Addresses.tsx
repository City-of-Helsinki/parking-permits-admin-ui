import { gql, useQuery } from '@apollo/client';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../../../auth/utils';
import AddressesDataTable from '../../../components/superAdmin/addresses/AddressesDataTable';
import { OrderDirection } from '../../../components/types';
import { AddressesQueryData, OrderBy } from '../../../types';
import styles from './Addresses.module.scss';

const T_PATH = 'pages.superAdmin.addresses';

const ADDRESSES_QUERY = gql`
  query GetAddresses($pageInput: PageInput!, $orderBy: OrderByInput) {
    addresses(pageInput: $pageInput, orderBy: $orderBy) {
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

  const pageParam = searchParams.get('page');
  const orderFieldParam = searchParams.get('orderField');
  const orderDirectionParam = searchParams.get('orderDirection');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const orderBy: OrderBy = {
    orderField: orderFieldParam || '',
    orderDirection:
      (orderDirectionParam as OrderDirection) || OrderDirection.DESC,
  };
  const variables = {
    pageInput: { page },
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const handlePage = (newPage: number) => {
    const urlSearchParams = {
      ...orderBy,
      page: newPage,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { newPage },
      orderBy,
    });
  };
  const handleOrderBy = (newOrderBy: OrderBy) => {
    const urlSearchParams = {
      ...newOrderBy,
      page,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { page },
      orderBy: newOrderBy,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="{styles.title} heading-l">{t(`${T_PATH}.title`)}</h2>
        <div className={styles.actions}>
          <Button onClick={() => navigate('create')}>
            {t(`${T_PATH}.addNewAddress`)}
          </Button>
        </div>
      </div>
      <div className={styles.content}>
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
          style={{ zIndex: 100 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};
export default makePrivate(Addresses);
