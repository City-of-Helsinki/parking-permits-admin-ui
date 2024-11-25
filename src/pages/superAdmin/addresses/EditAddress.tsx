import { gql, useMutation, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import AddressForm from '../../../components/superAdmin/addresses/AddressForm';
import { Address, MutationResponse } from '../../../types';
import styles from './EditAddress.module.scss';

const T_PATH = 'pages.superAdmin.editAddress';

const ADDRESS_QUERY = gql`
  query GetAddress($addressId: ID!) {
    address(addressId: $addressId) {
      id
      streetName
      streetNameSv
      streetNumber
      postalCode
      city
      citySv
      location
      zone {
        name
        label
        labelSv
      }
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = gql`
  mutation UpdateAddress($addressId: ID!, $address: AddressInput!) {
    updateAddress(addressId: $addressId, address: $address) {
      success
    }
  }
`;

const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($addressId: ID!) {
    deleteAddress(addressId: $addressId) {
      success
    }
  }
`;

const EditAddress = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { id: addressId } = useParams();
  const variables = { addressId };
  const basePath = '/admin/addresses';
  const { loading, data } = useQuery<{ address: Address }>(ADDRESS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  const [updateAddress] = useMutation<MutationResponse>(
    UPDATE_ADDRESS_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  const [deleteAddress] = useMutation<MutationResponse>(
    DELETE_ADDRESS_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  const handleDeleteAddress = () => {
    deleteAddress({ variables: { addressId } });
  };
  if (loading) {
    return <div>{t(`${T_PATH}.loading`)}</div>;
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        {data?.address && (
          <AddressForm
            onSubmit={address =>
              updateAddress({ variables: { addressId, address } })
            }
            onDelete={() => setIsConfirmDialogOpen(true)}
            onCancel={() => navigate(basePath)}
            address={data.address}
            className={styles.addressForm}
          />
        )}
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={t(`${T_PATH}.confirmTitle`)}
        message={t(`${T_PATH}.confirmMessage`)}
        confirmLabel={t(`${T_PATH}.confirm`)}
        cancelLabel={t(`${T_PATH}.cancel`)}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          handleDeleteAddress();
        }}
        onCancel={() => setIsConfirmDialogOpen(false)}
        isDeleteConfirmation
      />
      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};
export default makePrivate(EditAddress);
