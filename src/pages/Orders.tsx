import { gql, useQuery } from '@apollo/client';
import { LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import OrdersDataTable from '../components/orders/OrdersDataTable';
import OrdersSearch from '../components/orders/OrdersSearch';
import { OrderDirection } from '../components/types';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { OrderBy, OrdersQueryData } from '../types';
import styles from './Orders.module.scss';

const T_PATH = 'pages.orders';

const ORDERS_QUERY = gql`
  query GetOrders($pageInput: PageInput!, $orderBy: OrderByInput) {
    orders(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        totalPrice
        paidTime
        paymentType
        customer {
          firstName
          lastName
        }
        orderPermits {
          id
          type
          vehicle {
            manufacturer
            model
            registrationNumber
          }
          parkingZone {
            name
          }
          address {
            streetName
            streetNameSv
            streetNumber
            city
            citySv
          }
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

const Orders = (): React.ReactElement => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const exportData = useExportData();
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
  const { loading, data, refetch } = useQuery<OrdersQueryData>(ORDERS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });

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
  const handleExport = () => {
    const url = formatExportUrl('orders', {
      ...orderBy,
      page: page.toString(),
    });
    exportData(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <OrdersSearch />
      <div className={styles.content}>
        <OrdersDataTable
          orders={data.orders.objects}
          pageInfo={data.orders.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={handlePage}
          onOrderBy={handleOrderBy}
          onExport={handleExport}
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

export default makePrivate(Orders);
