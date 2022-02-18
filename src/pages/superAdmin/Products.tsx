import { gql, useQuery } from '@apollo/client';
import { Button, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../auth/utils';
import ProductsDataTable from '../../components/superAdmin/products/ProductsDataTable';
import { OrderBy, ProductsQueryData } from '../../types';
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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, data } = useQuery<ProductsQueryData>(PRODUCTS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <ProductsDataTable
          products={data?.products.objects || []}
          pageInfo={data?.products.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
          onRowClick={product => navigate(product.id)}
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
