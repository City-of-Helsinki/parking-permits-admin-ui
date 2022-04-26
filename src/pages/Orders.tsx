import { gql, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makePrivate } from '../auth/utils';
import OrdersDataTable from '../components/orders/OrdersDataTable';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { OrderBy, OrdersQueryData } from '../types';
import styles from './Permits.module.scss';

const T_PATH = 'pages.orders';

const ORDERS_QUERY = gql`
  query GetOrders($pageInput: PageInput!, $orderBy: OrderByInput) {
    orders(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        orderNumber
        orderType
        totalPrice
        paidTime
        paymentType
        customer {
          firstName
          lastName
        }
        orderPermits {
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
  const exportData = useExportData();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, data } = useQuery<OrdersQueryData>(ORDERS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const handleExport = () => {
    const url = formatExportUrl('orders', orderBy);
    exportData(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <OrdersDataTable
          orders={data.orders.objects}
          pageInfo={data.orders.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
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
