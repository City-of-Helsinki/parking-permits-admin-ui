import { gql, useQuery } from '@apollo/client';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../../../auth/utils';
import ProductsDataTable from '../../../components/superAdmin/products/ProductsDataTable';
import { OrderDirection } from '../../../components/types';
import useExportData from '../../../export/useExportData';
import { formatExportUrl } from '../../../export/utils';
import { OrderBy, ProductsQueryData } from '../../../types';
import styles from './Products.module.scss';

const T_PATH = 'pages.superAdmin.products';

const PRODUCTS_QUERY = gql`
  query GetProducts($pageInput: PageInput!, $orderBy: OrderByInput) {
    products(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        type
        zone
        unitPrice
        startDate
        endDate
        vat
        vatPercentage
        lowEmissionDiscount
        secondaryVehicleIncreaseRate
        modifiedAt
        modifiedBy
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

const Products = (): React.ReactElement => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const { loading, data, refetch } = useQuery<ProductsQueryData>(
    PRODUCTS_QUERY,
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
  const handleExport = () => {
    const url = formatExportUrl('products', {
      ...orderBy,
      page: page.toString(),
    });
    exportData(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <ProductsDataTable
          products={data?.products.objects || []}
          pageInfo={data?.products.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={handlePage}
          onOrderBy={handleOrderBy}
          onRowClick={product => navigate(product.id)}
          onExport={handleExport}
        />
        <div className={styles.actions}>
          <Button onClick={() => navigate('create')}>
            {t(`${T_PATH}.addNewPrice`)}
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
export default makePrivate(Products);
