import { gql, useMutation, useQuery } from '@apollo/client';
import { Formik } from 'formik';
import { Button, Notification, TextInput } from 'hds-react';
import { isValidIBAN } from 'ibantools';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/no-namespace
import * as Yup from 'yup';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import RefundsDataTable from '../components/refunds/RefundsDataTable';
import { MutationResponse, Refund, RefundInput } from '../types';
import styles from './RefundDetail.module.scss';

const T_PATH = 'pages.refundDetail';

const REFUND_DETAIL_QUERY = gql`
  query GetRefundDetail($refundNumber: Int!) {
    refund(refundNumber: $refundNumber) {
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
  }
`;

const UPDATE_REFUND_MUTATION = gql`
  mutation UpdateRefund($refundNumber: Int!, $refund: RefundInput!) {
    updateRefund(refundNumber: $refundNumber, refund: $refund) {
      success
    }
  }
`;

const RefundDetail = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const [errorMessage, setErrorMessage] = useState('');
  const refundNumber = parseInt(params.refundNumber as string, 10);
  const variables = { refundNumber };
  const { loading, data } = useQuery<{ refund: Refund }>(REFUND_DETAIL_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  const [updateRefund] = useMutation<MutationResponse>(UPDATE_REFUND_MUTATION, {
    onCompleted: () => navigate('/refunds'),
    onError: e => setErrorMessage(e.message),
  });

  if (loading) {
    return <div>Loading..</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const { name, iban } = data.refund;
  const initialValues: RefundInput = { name, iban };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t(`${T_PATH}.nameIsRequired`)),
    iban: Yup.string()
      .required(`${T_PATH}.IbanIsRequired`)
      .test({
        name: 'isValidIBAN',
        test: value => isValidIBAN(value as string),
        message: t('errors.invalidIBAN'),
      }),
  });

  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/refunds">{t(`${T_PATH}.refunds`)}</Link>
        <span>{refundNumber}</span>
      </Breadcrumbs>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <Formik
          validateOnChange
          validateOnBlur
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(refund: RefundInput) =>
            updateRefund({
              variables: {
                refundNumber,
                refund,
              },
            })
          }>
          {({
            values,
            errors,
            touched,
            dirty,
            isValid,
            handleSubmit,
            handleChange,
            handleBlur,
          }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.fieldRow}>
                <TextInput
                  required
                  className={styles.nameInput}
                  id="name"
                  name="name"
                  label={t(`${T_PATH}.name`)}
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errorText={
                    touched.name && errors.name ? errors.name : undefined
                  }
                />
                <TextInput
                  required
                  className={styles.ibanInput}
                  id="iban"
                  name="iban"
                  label="IBAN"
                  value={values.iban}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errorText={
                    touched.iban && errors.iban ? errors.iban : undefined
                  }
                />
              </div>
              <div className={styles.refundDetail}>
                <RefundsDataTable refunds={[data.refund]} />
              </div>
              <div className={styles.actions}>
                <Button
                  className={styles.save}
                  disabled={!(dirty && isValid)}
                  type="submit">
                  {t(`${T_PATH}.save`)}
                </Button>
                <Button
                  variant="secondary"
                  className={styles.cancel}
                  onClick={() => navigate('/refunds')}>
                  {t(`${T_PATH}.cancel`)}
                </Button>
              </div>
            </form>
          )}
        </Formik>
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
export default makePrivate(RefundDetail);
