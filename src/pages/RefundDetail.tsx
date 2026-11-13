import { gql, useMutation, useQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  ButtonVariant,
  IconArrowUndo,
  IconCheckCircle,
  IconDownload,
  Notification,
  TextInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router';
import * as Yup from 'yup';
import useUserRole, { UserRole } from '../api/useUserRole';
import makePrivate from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import RefundsDataTable from '../components/refunds/RefundsDataTable';
import useExportData from '../export/useExportData';
import { formatExportUrlPdf } from '../export/utils';
import { MutationResponse, Refund, RefundInput } from '../types';
import { getApolloErrorMessage, isValidIBAN } from '../utils';
import styles from './RefundDetail.module.scss';

const T_PATH = 'pages.refundDetail';

const REFUND_DETAIL_QUERY = gql`
  query GetRefundDetail($refundId: ID!) {
    refund(refundId: $refundId) {
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
  }
`;

const UPDATE_REFUND_MUTATION = gql`
  mutation UpdateRefund($refundId: ID!, $refund: RefundInput!) {
    updateRefund(refundId: $refundId, refund: $refund) {
      success
    }
  }
`;

interface RefundFormProps {
  refund: Refund;
  onSubmit: (refund: RefundInput) => unknown;
  onCancel: () => void;
  onExport: () => void;
}

const RefundForm = ({
  refund,
  onSubmit,
  onCancel,
  onExport,
}: RefundFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const userRole = useUserRole();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t(`${T_PATH}.nameIsRequired`)),
    iban: Yup.string()
      .required(t(`${T_PATH}.ibanIsRequired`))
      .test({
        name: 'isValidIBAN',
        test: value => isValidIBAN(value),
        message: t('errors.invalidIBAN'),
      }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<RefundInput>({
    mode: 'onTouched',
    defaultValues: { name: refund.name, iban: refund.iban },
    resolver: yupResolver(validationSchema),
  });
  const ibanField = register('iban');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.fieldRow}>
        <TextInput
          required
          className={styles.nameInput}
          id="name"
          label={t(`${T_PATH}.name`)}
          disabled={userRole <= UserRole.PREPARATORS}
          errorText={errors.name?.message}
          {...register('name')}
        />
        <TextInput
          required
          className={styles.ibanInput}
          disabled={userRole <= UserRole.PREPARATORS}
          id="iban"
          label="IBAN"
          errorText={errors.iban?.message}
          {...ibanField}
          onChange={e => {
            const { target } = e;
            let position = target.selectionEnd || 0;
            const { length } = target.value;
            target.value = target.value
              .replace(/[^\dA-Z]/g, '')
              .replace(/(.{4})/g, '$1 ')
              .trim();
            position +=
              target.value.charAt(position - 1) === ' ' &&
              target.value.charAt(length - 1) === ' ' &&
              length !== target.value.length
                ? 1
                : 0;
            target.selectionEnd = position;
            ibanField.onChange(e);
          }}
        />
      </div>
      <div className={styles.refundDetail}>
        <RefundsDataTable refunds={[refund]} />
      </div>
      <div className={styles.actions}>
        {userRole > UserRole.PREPARATORS && (
          <Button
            className={styles.save}
            iconStart={<IconCheckCircle />}
            disabled={!(isDirty && isValid) || isSubmitting}
            type="submit">
            {t(`${T_PATH}.${isSubmitting ? 'saving' : 'save'}`)}
          </Button>
        )}
        <Button
          className={styles.downloadPdf}
          variant={ButtonVariant.Secondary}
          iconStart={<IconDownload />}
          onClick={onExport}>
          {t(`${T_PATH}.downloadPdf`)}
        </Button>
        {userRole > UserRole.PREPARATORS && (
          <Button
            variant={ButtonVariant.Secondary}
            className={styles.cancel}
            iconStart={<IconArrowUndo />}
            onClick={onCancel}>
            {t(`${T_PATH}.cancel`)}
          </Button>
        )}
      </div>
    </form>
  );
};

const RefundDetail = (): React.ReactElement => {
  const navigate = useNavigate();
  const exportData = useExportData();
  const { t } = useTranslation();
  const { id: refundId } = useParams();
  const [errorMessage, setErrorMessage] = useState('');
  const variables = { refundId };
  const { loading, data } = useQuery<{ refund: Refund }>(REFUND_DETAIL_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(getApolloErrorMessage(error)),
  });
  const [updateRefund] = useMutation<MutationResponse>(UPDATE_REFUND_MUTATION, {
    onCompleted: () => navigate('/refunds'),
    onError: e => setErrorMessage(e.message),
  });
  const handleExport = () => {
    const url = formatExportUrlPdf('refund', refundId || '');
    exportData(url);
  };

  if (loading) {
    return <div>{t(`${T_PATH}.loading`)}</div>;
  }

  if (!data) {
    return <div>{t(`${T_PATH}.noData`)}</div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/refunds">{t(`${T_PATH}.refunds`)}</Link>
        <span>{refundId}</span>
      </Breadcrumbs>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <RefundForm
          refund={data.refund}
          onSubmit={refund => updateRefund({ variables: { refundId, refund } })}
          onCancel={() => navigate('/refunds')}
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
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};
export default makePrivate(RefundDetail);
