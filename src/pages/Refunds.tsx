import { gql, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../auth/utils';
import RefundsDataTable from '../components/refunds/RefundsDataTable';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { OrderBy, RefundsQueryData } from '../types';
import styles from './Permits.module.scss';

const T_PATH = 'pages.refunds';

const REFUNDS_QUERY = gql`
  query GetRefunds($pageInput: PageInput!, $orderBy: OrderByInput) {
    refunds(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        refundNumber
        name
        amount
        iban
        status
        description
        createdAt
        createdBy
        modifiedAt
        modifiedBy
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

const Refunds = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const exportData = useExportData();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = {
    pageInput: { page },
    orderBy,
  };
  const { loading, data } = useQuery<RefundsQueryData>(REFUNDS_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });

  if (loading) {
    return <div>loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const handleExport = () => {
    const url = formatExportUrl('refunds', orderBy);
    exportData(url);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <RefundsDataTable
          refunds={data.refunds.objects}
          pageInfo={data.refunds.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
          onRowClick={refund => navigate(refund.refundNumber.toString())}
          onExport={handleExport}
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

export default makePrivate(Refunds);
