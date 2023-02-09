import { gql, useMutation } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import LowEmissionCriterionForm from '../../../components/superAdmin/lowEmissionCriteria/LowEmissionCriterionForm';
import { MutationResponse } from '../../../types';
import styles from './CreateLowEmissionCriterion.module.scss';

const T_PATH = 'pages.superAdmin.createLowEmissionCriterion';

const CREATE_LOW_EMISSION_CRITERION_MUTATION = gql`
  mutation CreateLowEmissionCriterion($criterion: LowEmissionCriterionInput!) {
    createLowEmissionCriterion(criterion: $criterion) {
      success
    }
  }
`;

const CreateLowEmissionCriterion = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const basePath = '/admin/lowEmissionCriteria';
  const [createCriterion] = useMutation<MutationResponse>(
    CREATE_LOW_EMISSION_CRITERION_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <LowEmissionCriterionForm
          onSubmit={criterion => createCriterion({ variables: { criterion } })}
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
export default makePrivate(CreateLowEmissionCriterion);
