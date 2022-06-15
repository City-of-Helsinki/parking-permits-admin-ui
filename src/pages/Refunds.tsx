import { gql, useMutation, useQuery } from '@apollo/client';
import {
  Button,
  IconArrowRight,
  IconCheckCircle,
  Notification,
} from 'hds-react';
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
  RefundStatus,
  RefundStatusOrAll,
} from '../types';
import styles from './Refunds.module.scss';

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
        acceptedAt
        acceptedBy
        order {
          id
          orderPermits {
            vehicle {
              registrationNumber
            }
          }
        }
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

const REQUEST_FOR_APPROVAL_MUTATION = gql`
  mutation RequestForApproval($ids: [ID]!) {
    requestForApproval(ids: $ids)
  }
`;

const ACCEPT_REFUNDS_MUTATION = gql`
  mutation AcceptRefunds($ids: [ID]!) {
    acceptRefunds(ids: $ids)
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

  const [requestForApproval] = useMutation<{ requestForApproval: number }>(
    REQUEST_FOR_APPROVAL_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setSelectedRefunds([]);
      },
      onError: error => setErrorMessage(error.message),
    }
  );

  const [acceptRefunds] = useMutation<{ acceptRefunds: number }>(
    ACCEPT_REFUNDS_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setSelectedRefunds([]);
      },
      onError: error => setErrorMessage(error.message),
    }
  );

  const canRequestForApproval =
    selectedRefunds.length > 0 &&
    selectedRefunds.every(refund => refund.status === RefundStatus.OPEN);
  const canAcceptRefunds =
    selectedRefunds.length > 0 &&
    selectedRefunds.every(
      refund => refund.status === RefundStatus.REQUEST_FOR_APPROVAL
    );

  if (loading) {
    return <div>loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const handleExport = () => {
    const url = formatExportUrl('refunds', {
      ...refundSearchParams,
      ...orderBy,
      page: page.toString(),
    });
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
      <div className={styles.footer}>
        <div className={styles.actions}>
          <Button
            disabled={!canRequestForApproval}
            className={styles.actionButton}
            theme="black"
            iconLeft={<IconArrowRight />}
            onClick={() =>
              requestForApproval({
                variables: { ids: selectedRefunds.map(refund => refund.id) },
              })
            }>
            {t(`${T_PATH}.requestForApproval`)}
          </Button>
          <Button
            disabled={!canAcceptRefunds}
            className={styles.actionButton}
            theme="black"
            iconLeft={<IconCheckCircle />}
            onClick={() =>
              acceptRefunds({
                variables: { ids: selectedRefunds.map(refund => refund.id) },
              })
            }>
            {t(`${T_PATH}.acceptRefunds`)}
          </Button>
        </div>
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
