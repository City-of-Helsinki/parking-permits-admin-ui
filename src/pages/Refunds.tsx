import { gql, useLazyQuery, useMutation } from '@apollo/client';
import {
  Button,
  IconArrowRight,
  IconCheckCircle,
  Notification,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Navigate, useSearchParams } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import { makePrivate } from '../auth/utils';
import RefundsDataTable from '../components/refunds/RefundsDataTable';
import RefundsSearch from '../components/refunds/RefundsSearch';
import useExportData from '../export/useExportData';
import { formatExportUrl } from '../export/utils';
import { useOrderByParam, usePageParam } from '../hooks/searchParam';
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
        refundPermits {
          id
          vehicle {
            registrationNumber
          }
        }
        refundOrders {
          id
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
  const userRole = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const exportData = useExportData();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRefunds, setSelectedRefunds] = useState<Refund[]>([]);

  const { pageParam: page, setPageParam } = usePageParam();
  const { orderByParam: orderBy, setOrderBy } = useOrderByParam();

  const statusParam = searchParams.get('status');
  const qParam = searchParams.get('q');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  const paymentTypesParam = searchParams.get('paymentTypes');

  const refundSearchParams: RefundSearchParams = {
    q: qParam || '',
    startDate: startDateParam || '',
    endDate: endDateParam || '',
    status: (statusParam as RefundStatusOrAll) || 'ALL',
    paymentTypes: paymentTypesParam || '',
  };
  const variables = {
    pageInput: { page },
    orderBy,
    searchParams: refundSearchParams,
  };

  const [getRefunds, { loading, data, refetch }] =
    useLazyQuery<RefundsQueryData>(REFUNDS_QUERY, {
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

  if (userRole < UserRole.PREPARATORS) {
    return <Navigate to="/permits" />;
  }

  const canRequestForApproval =
    selectedRefunds &&
    selectedRefunds.length > 0 &&
    selectedRefunds.every(refund => refund.status === RefundStatus.OPEN);
  const canAcceptRefunds =
    selectedRefunds &&
    selectedRefunds.length > 0 &&
    selectedRefunds.every(
      refund => refund.status === RefundStatus.REQUEST_FOR_APPROVAL
    );

  const handlePage = (newPage: number) => {
    setPageParam(newPage);

    refetch({
      pageInput: { page: newPage },
    });
  };

  const handleSearch = (newSearchParams: RefundSearchParams) => {
    setSearchParams(
      new URLSearchParams({
        ...newSearchParams,
        ...orderBy,
        page: '1',
      }),
      { replace: true }
    );

    getRefunds({
      variables: {
        searchParams: newSearchParams,
        pageInput: { page: 1 },
        orderBy,
      },
    });
  };

  const handleOrderBy = (newOrderBy: OrderBy) => {
    setOrderBy(newOrderBy);

    refetch({
      orderBy: newOrderBy,
    });
  };

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
      <h2>{t(`${T_PATH}.title`)}</h2>
      <div className={styles.content}>
        <RefundsSearch
          searchParams={refundSearchParams}
          onSearch={handleSearch}
        />
        <RefundsDataTable
          selection={selectedRefunds}
          refunds={data?.refunds.objects}
          pageInfo={data?.refunds.pageInfo}
          loading={loading}
          orderBy={orderBy}
          onPage={handlePage}
          onOrderBy={handleOrderBy}
          onRowClick={refund => navigate(refund.id)}
          onExport={handleExport}
          onSelectionChange={selection => setSelectedRefunds(selection || [])}
        />
      </div>
      {userRole >= UserRole.SANCTIONS && (
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
            {userRole >= UserRole.SANCTIONS_AND_REFUNDS && (
              <Button
                disabled={!canAcceptRefunds}
                className={styles.actionButton}
                theme="black"
                iconLeft={<IconCheckCircle />}
                onClick={() =>
                  acceptRefunds({
                    variables: {
                      ids: selectedRefunds.map(refund => refund.id),
                    },
                  })
                }>
                {t(`${T_PATH}.acceptRefunds`)}
              </Button>
            )}
          </div>
        </div>
      )}
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

export default makePrivate(Refunds);
