import { gql, useMutation } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import ProductForm from '../../../components/superAdmin/products/ProductForm';
import { MutationResponse } from '../../../types';
import styles from './CreateProduct.module.scss';

const T_PATH = 'pages.superAdmin.createProduct';

const CREATE_PRODUCT_MUTATION = gql`
  mutation createProduct($product: ProductInput!) {
    createProduct(product: $product) {
      success
    }
  }
`;

const Products = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const basePath = '/admin/products';
  const [createProduct] = useMutation<MutationResponse>(
    CREATE_PRODUCT_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <ProductForm
          onSubmit={product => createProduct({ variables: { product } })}
          className={styles.productForm}
          onCancel={() => navigate(basePath)}
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
export default makePrivate(Products);
