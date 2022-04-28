import { gql, useMutation, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import ProductForm from '../../../components/superAdmin/products/ProductForm';
import { MutationResponse, Product } from '../../../types';
import styles from './EditProduct.module.scss';

const T_PATH = 'pages.superAdmin.editProduct';

const PRODUCT_QUERY = gql`
  query GetProduct($productId: ID!) {
    product(productId: $productId) {
      id
      type
      unitPrice
      unit
      startDate
      endDate
      vat
      vatPercentage
      zone
      lowEmissionDiscount
      secondaryVehicleIncreaseRate
      modifiedAt
      modifiedBy
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation updateProduct($productId: ID!, $product: ProductInput!) {
    updateProduct(productId: $productId, product: $product) {
      success
    }
  }
`;

const DELETE_PRODUCT_MUTATION = gql`
  mutation deleteProduct($productId: ID!) {
    deleteProduct(productId: $productId) {
      success
    }
  }
`;

const Products = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const { id: productId } = useParams();
  const variables = { productId };
  const { loading, data } = useQuery<{ product: Product }>(PRODUCT_QUERY, {
    variables,
    onError: error => setErrorMessage(error.message),
  });
  const [updateProduct] = useMutation<MutationResponse>(
    UPDATE_PRODUCT_MUTATION,
    {
      onCompleted: () => navigate('/admin/products'),
      onError: e => setErrorMessage(e.message),
    }
  );
  const [deleteProduct] = useMutation<MutationResponse>(
    DELETE_PRODUCT_MUTATION,
    {
      onCompleted: () => navigate('/admin/products'),
      onError: e => setErrorMessage(e.message),
    }
  );
  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        {data?.product && (
          <ProductForm
            onSubmit={product =>
              updateProduct({ variables: { productId, product } })
            }
            onDelete={() => deleteProduct({ variables: { productId } })}
            product={data.product}
            className={styles.productForm}
          />
        )}
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
