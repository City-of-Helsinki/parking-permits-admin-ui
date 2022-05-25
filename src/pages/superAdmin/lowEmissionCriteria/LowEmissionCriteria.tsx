import { gql, useQuery } from '@apollo/client';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import LowEmissionCriteriaDataTable from '../../../components/superAdmin/lowEmissionCriteria/LowEmissionCriteriaDataTable';
import { LowEmissionCriteriaQueryData, OrderBy } from '../../../types';
import styles from './LowEmissionCriteria.module.scss';

const T_PATH = 'pages.superAdmin.lowEmissionCriteria';

const LOW_EMISSION_CRITERIA_QUERY = gql`
  query GetLowEmissionCriteria($pageInput: PageInput!, $orderBy: OrderByInput) {
    lowEmissionCriteria(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        powerType
        nedcMaxEmissionLimit
        wltpMaxEmissionLimit
        euroMinClassLimit
        startDate
        endDate
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

const LowEmissionCriteria = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, data } = useQuery<LowEmissionCriteriaQueryData>(
    LOW_EMISSION_CRITERIA_QUERY,
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
        <div className={styles.actions}>
          <Button onClick={() => navigate('create')}>
            {t(`${T_PATH}.addNewCriterion`)}
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <LowEmissionCriteriaDataTable
          criteria={data.lowEmissionCriteria.objects || []}
          pageInfo={data.lowEmissionCriteria.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
          onRowClick={criterion => navigate(criterion.id as string)}
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
export default makePrivate(LowEmissionCriteria);
