import { gql, useLazyQuery } from '@apollo/client';
import { format, parse } from 'date-fns';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import OrdersDataTable from '../components/orders/OrdersDataTable';
import OrdersSearch from '../components/orders/OrdersSearch';
import { OrderDirection } from '../components/types';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import {
  OrderBy,
  OrderSearchParams,
  OrdersQueryData,
  PaymentType,
  PermitContractType,
  PriceDiscount,
} from '../types';
import styles from './Orders.module.scss';

const T_PATH = 'pages.orders';

const ORDERS_QUERY = gql`
  query GetOrders(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: OrderSearchParamsInput
  ) {
    orders(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
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
            id
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

  const reformatISODate = (dateString: string) =>
    format(parse(dateString, 'yyyy-MM-dd', new Date()), 'd.M.yyyy');

  const ordersSearchParams: OrderSearchParams = {
    q: searchParams.get('q') || '',
    startDate: searchParams.get('startDate')
      ? reformatISODate(searchParams.get('startDate') as string)
      : '',
    endDate: searchParams.get('endDate')
      ? reformatISODate(searchParams.get('endDate') as string)
      : '',
    contractTypes: searchParams.get('contractTypes') as PermitContractType,
    paymentTypes: searchParams.get('paymentTypes') as PaymentType,
    priceDiscounts: searchParams.get('priceDiscounts') as PriceDiscount,
    parkingZone: searchParams.get('parkingZone') || '',
  };

  const variables = {
    pageInput: { page },
    orderBy,
  };
  const [getOrders, { loading, data, refetch }] = useLazyQuery<OrdersQueryData>(
    ORDERS_QUERY,
    {
      variables,
      fetchPolicy: 'no-cache',
      onError: error => setErrorMessage(error.message),
    }
  );

  const handleSearch = (newSearchParams: OrderSearchParams) => {
    setSearchParams(
      new URLSearchParams({
        ...newSearchParams,
        ...orderBy,
        page: '1',
      }),
      { replace: true }
    );

    getOrders({
      variables: {
        searchParams: newSearchParams,
        pageInput: { page: 1 },
        orderBy,
      },
    });
  };

  const handlePage = (newPage: number) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams, { replace: true });

    refetch({
      pageInput: { page: newPage },
    });
  };

  const handleOrderBy = (newOrderBy: OrderBy) => {
    Object.entries(newOrderBy).forEach(([k, v]) => searchParams.set(k, v));
    setSearchParams(searchParams, { replace: true });

    refetch({
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
      <OrdersSearch searchParams={ordersSearchParams} onSubmit={handleSearch} />
      <div className={styles.content}>
        <OrdersDataTable
          orders={data?.orders.objects}
          pageInfo={data?.orders.pageInfo}
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
