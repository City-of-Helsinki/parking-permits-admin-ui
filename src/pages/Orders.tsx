import { gql, useLazyQuery } from '@apollo/client';
import { format, parse } from 'date-fns';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import { makePrivate } from '../auth/utils';
import OrdersDataTable from '../components/orders/OrdersDataTable';
import OrdersSearch from '../components/orders/OrdersSearch';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { useOrderByParam, usePageParam } from '../hooks/searchParam';
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
  const userRole = useUserRole();

  const { pageParam: page, setPageParam } = usePageParam();
  const { orderByParam: orderBy, setOrderBy } = useOrderByParam();

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

  if (userRole < UserRole.PREPARATORS) {
    return <Navigate to="/permits" />;
  }

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
    const url = formatExportUrl('orders', searchParams);
    exportData(url);
  };

  return (
    <div className={styles.container}>
      <h2>{t(`${T_PATH}.title`)}</h2>
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
