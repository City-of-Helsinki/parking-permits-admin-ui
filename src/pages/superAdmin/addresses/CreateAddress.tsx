import { gql, useMutation } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import AddressForm from '../../../components/superAdmin/addresses/AddressForm';
import { MutationResponse } from '../../../types';
import styles from './CreateAddress.module.scss';

const T_PATH = 'pages.superAdmin.addresses.createAddress';

const CREATE_ADDRESS_MUTATION = gql`
  mutation CreateAddress($address: AddressInput!) {
    createAddress(address: $address) {
      success
    }
  }
`;

const CreateAddress = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [createAddress] = useMutation<MutationResponse>(
    CREATE_ADDRESS_MUTATION,
    {
      onCompleted: () => navigate('/admin/addresses'),
      onError: e => setErrorMessage(e.message),
    }
  );
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <AddressForm
          onSubmit={address => createAddress({ variables: { address } })}
          className={styles.addressForm}
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
export default makePrivate(CreateAddress);
