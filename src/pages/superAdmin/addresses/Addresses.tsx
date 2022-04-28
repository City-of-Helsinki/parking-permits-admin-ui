import { gql, useQuery } from '@apollo/client';
import { Button, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import AddressesDataTable from '../../../components/superAdmin/addresses/AddressesDataTable';
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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, data } = useQuery<AddressesQueryData>(ADDRESSES_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <AddressesDataTable
          addresses={data?.addresses.objects || []}
          pageInfo={data?.addresses.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
          onRowClick={address => navigate(address.id as string)}
        />
        <div className={styles.actions}>
          <Button onClick={() => navigate('create')}>
            {t(`${T_PATH}.addNewAddress`)}
          </Button>
        </div>
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
