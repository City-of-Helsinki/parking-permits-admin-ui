import { gql, useMutation, useQuery } from '@apollo/client';
import { LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LowEmissionCriterionForm from '../../../components/superAdmin/lowEmissionCriteria/LowEmissionCriterionForm';
import { LowEmissionCriterion, MutationResponse } from '../../../types';
import styles from './EditLowEmissionCriterion.module.scss';

const T_PATH = 'pages.superAdmin.editLowEmissionCriterion';

const LOW_EMISSION_CRITERION_QUERY = gql`
  query GetLowEmissionCriterion($criterionId: ID!) {
    lowEmissionCriterion(criterionId: $criterionId) {
      id
      nedcMaxEmissionLimit
      wltpMaxEmissionLimit
      euroMinClassLimit
      startDate
      endDate
    }
  }
`;

const UPDATE_LOW_EMISSION_CRITERION_MUTATION = gql`
  mutation UpdateLowEmissionCriterion(
    $criterionId: ID!
    $criterion: LowEmissionCriterionInput!
  ) {
    updateLowEmissionCriterion(
      criterionId: $criterionId
      criterion: $criterion
    ) {
      success
    }
  }
`;

const DELETE_LOW_EMISSION_CRITERION_MUTATION = gql`
  mutation DeleteLowEmissionCriterion($criterionId: ID!) {
    deleteLowEmissionCriterion(criterionId: $criterionId) {
      success
    }
  }
`;

const EditLowEmissionCriterion = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { id: criterionId } = useParams();
  const variables = { criterionId };
  const basePath = '/admin/lowEmissionCriteria';
  const { loading, data } = useQuery<{
    lowEmissionCriterion: LowEmissionCriterion;
  }>(LOW_EMISSION_CRITERION_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  const [updateCriterion] = useMutation<MutationResponse>(
    UPDATE_LOW_EMISSION_CRITERION_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  const [deleteCriterion] = useMutation<MutationResponse>(
    DELETE_LOW_EMISSION_CRITERION_MUTATION,
    {
      onCompleted: () => navigate(basePath),
      onError: e => setErrorMessage(e.message),
    }
  );
  const handleDeleteCriterion = () => {
    deleteCriterion({ variables: { criterionId } });
  };
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!data) {
    return <div>no data</div>;
  }
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <LowEmissionCriterionForm
          onSubmit={criterion =>
            updateCriterion({ variables: { criterionId, criterion } })
          }
          onDelete={() => setIsConfirmDialogOpen(true)}
          onCancel={() => navigate(basePath)}
          criterion={data.lowEmissionCriterion}
        />
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={t(`${T_PATH}.confirmTitle`)}
        message={t(`${T_PATH}.confirmMessage`)}
        confirmLabel={t(`${T_PATH}.confirm`)}
        cancelLabel={t(`${T_PATH}.cancel`)}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          handleDeleteCriterion();
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
export default makePrivate(EditLowEmissionCriterion);
