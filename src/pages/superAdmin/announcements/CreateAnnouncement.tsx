import { gql, useMutation } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import AnnouncementForm from '../../../components/superAdmin/announcements/AnnouncementForm';
import { MutationResponse } from '../../../types';

const T_PATH = 'pages.superAdmin.createAnnouncement';

const CREATE_ANNOUNCEMENTS_MUTATION = gql`
  mutation CreateAnnouncement($announcement: AnnouncementInput!) {
    createAnnouncement(announcement: $announcement) {
      success
    }
  }
`;

const CreateAnnouncement = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [createAnnouncement] = useMutation<MutationResponse>(
    CREATE_ANNOUNCEMENTS_MUTATION,
    {
      onCompleted: () => navigate('/admin/announcements'),
      onError: e => setErrorMessage(e.message),
    }
  );

  return (
    <div>
      <h2 className="heading-l">{t(`${T_PATH}.title`)}</h2>
      <div>
        <AnnouncementForm
          onSubmit={announcement =>
            createAnnouncement({ variables: { announcement } })
          }
          onCancel={() => navigate('/admin/announcements')}
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

export default makePrivate(CreateAnnouncement);
