import { gql, useMutation } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import makePrivate from '../../../auth/makePrivate';
import AddressForm from '../../../components/superAdmin/addresses/AddressForm';
import { MutationResponse } from '../../../types';

const T_PATH = 'pages.superAdmin.createAddress';

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
  const basePath = '/admin/addresses';

  const [createAddress] = useMutation<MutationResponse>(
    CREATE_ADDRESS_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );

  return (
    <div>
      <h2>{t(`${T_PATH}.title`)}</h2>
      <div>
        <AddressForm
          onSubmit={address => createAddress({ variables: { address } })}
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
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};

export default makePrivate(CreateAddress);
