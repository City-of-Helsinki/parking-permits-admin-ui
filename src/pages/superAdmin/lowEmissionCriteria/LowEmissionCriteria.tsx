import { gql, useQuery } from '@apollo/client';
import { Button, LoadingSpinner, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../../../auth/utils';
import LowEmissionCriteriaDataTable from '../../../components/superAdmin/lowEmissionCriteria/LowEmissionCriteriaDataTable';
import { OrderDirection } from '../../../components/types';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const pageParam = searchParams.get('page');
  const orderFieldParam = searchParams.get('orderField');
  const orderDirectionParam = searchParams.get('orderDirection');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const orderBy: OrderBy = {
    orderField: orderFieldParam || '',
    orderDirection:
      (orderDirectionParam as OrderDirection) || OrderDirection.DESC,
  };
  const variables = {
    pageInput: { page },
    orderBy,
  };

  const { loading, data, refetch } = useQuery<LowEmissionCriteriaQueryData>(
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

  const handlePage = (newPage: number) => {
    const urlSearchParams = {
      ...orderBy,
      page: newPage,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { newPage },
      orderBy,
    });
  };
  const handleOrderBy = (newOrderBy: OrderBy) => {
    const urlSearchParams = {
      ...newOrderBy,
      page,
    };
    setSearchParams(urlSearchParams as unknown as Record<string, string>, {
      replace: true,
    });
    refetch({
      pageInput: { page },
      orderBy: newOrderBy,
    });
  };

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
          onPage={handlePage}
          onOrderBy={handleOrderBy}
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
