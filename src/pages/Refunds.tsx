import { gql, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import RefundsDataTable from '../components/refunds/RefundsDataTable';
import RefundsSearch from '../components/refunds/RefundsSearch';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import {
  OrderBy,
  Refund,
  RefundSearchParams,
  RefundsQueryData,
  RefundStatusOrAll,
} from '../types';
import styles from './Permits.module.scss';

const T_PATH = 'pages.refunds';

const REFUNDS_QUERY = gql`
  query GetRefunds(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: RefundSearchParamsInput
  ) {
    refunds(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
      objects {
        id
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
  const [searchParams, setSearchParams] = useSearchParams();
  const exportData = useExportData();
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRefunds, setSelectedRefunds] = useState<Refund[]>([]);

  const refundSearchParams: RefundSearchParams = {
    q: searchParams.get('q') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    status: (searchParams.get('status') as RefundStatusOrAll) || 'ALL',
    paymentTypes: searchParams.get('paymentTypes') || '',
  };
  const variables = {
    pageInput: { page },
    orderBy,
    searchParams: refundSearchParams,
  };
  const { loading, data, refetch } = useQuery<RefundsQueryData>(REFUNDS_QUERY, {
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
        <RefundsSearch
          searchParams={refundSearchParams}
          onSearch={params => {
            setSearchParams(params as unknown as Record<string, string>, {
              replace: true,
            });
            refetch({
              pageInput: { page },
              orderBy,
              searchParams: params,
            });
          }}
        />
        <RefundsDataTable
          selection={selectedRefunds}
          refunds={data.refunds.objects}
          pageInfo={data.refunds.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={newPage => setPage(newPage)}
          onOrderBy={newOrderBy => setOrderBy(newOrderBy)}
          onRowClick={refund => navigate(refund.id)}
          onExport={handleExport}
          onSelectionChange={selection => setSelectedRefunds(selection)}
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
