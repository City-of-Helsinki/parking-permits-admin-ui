import { gql, useQuery } from '@apollo/client';
import { Button, LoadingSpinner } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import CustomerCard from '../../../components/superAdmin/customers/CustomerCard';
import useExportData from '../../../export/useExportData';
import { formatGdprApiUrl } from '../../../export/utils';
import { Customer } from '../../../types';
import styles from './ViewCustomer.module.scss';

const T_PATH = 'pages.superAdmin.viewCustomer';

const CUSTOMER_QUERY = gql`
  query GetCustomer($query: CustomerRetrieveInput!) {
    customer(query: $query) {
      id
      sourceId
      firstName
      lastName
      nationalIdNumber
      email
      phoneNumber
      primaryAddress {
        streetName
        streetNumber
        streetNameSv
        city
        citySv
        postalCode
      }
      otherAddress {
        streetName
        streetNumber
        streetNameSv
        city
        citySv
        postalCode
      }
      language
    }
  }
`;

const ViewCustomer = (): React.ReactElement => {
  const { t } = useTranslation('', { keyPrefix: T_PATH });
  const exportData = useExportData();
  const navigate = useNavigate();
  const { id: customerId } = useParams();
  const variables = { query: { id: customerId } };
  const { loading, data } = useQuery<{ customer: Customer }>(CUSTOMER_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
  });

  const handleExport = () => {
    const url = formatGdprApiUrl(['profiles', data?.customer.sourceId || '']);
    exportData(url);
  };

  return (
    <div className={styles.container}>
      {loading && <LoadingSpinner style={{ margin: 'auto' }} />}
      {!loading && data?.customer && (
        <>
          <h2>{t('personalInfo')}</h2>
          <div className={styles.row}>
            <CustomerCard customer={data.customer} />
          </div>
          <div className={styles.row}>
            <Button onClick={() => navigate('/admin/customers')}>
              {t('returnToList')}
            </Button>
            <Button onClick={handleExport} variant="secondary">
              {t('downloadCustomerData')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default makePrivate(ViewCustomer);
