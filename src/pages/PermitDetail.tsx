import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ChangeLogs from '../components/common/ChangeLogs';
import StatusTag from '../components/common/StatusTag';
import Zone from '../components/common/Zone';
import CustomerInfo from '../components/permitDetail/CustomerInfo';
import PermitInfo from '../components/permitDetail/PermitInfo';
import VehicleInfo from '../components/permitDetail/VehicleInfo';
import { PermitDetailData } from '../types';
import { formatCustomerName } from '../utils';
import styles from './PermitDetail.module.scss';

const T_PATH = 'pages.permitDetail';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      identifier
      startTime
      endTime
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      changeLogs {
        id
        event
        description
        createdAt
        createdBy
      }
      customer {
        firstName
        lastName
        nationalIdNumber
        email
        phoneNumber
        primaryAddress {
          streetName
          streetNameSv
          streetNumber
        }
      }
      vehicle {
        manufacturer
        model
        registrationNumber
        isLowEmission
        holder
      }
      parkingZone {
        name
        description
        descriptionSv
        price
      }
    }
  }
`;

const PermitDetail = (): React.ReactElement => {
  const params = useParams();
  const { t } = useTranslation();
  const { id } = params;
  const variables = { permitId: id };
  const { loading, error, data } = useQuery<PermitDetailData>(
    PERMIT_DETAIL_QUERY,
    {
      variables,
    }
  );
  if (loading) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <div>No data</div>;
  }
  const { permitDetail } = data;
  const { status, customer, parkingZone, changeLogs } = permitDetail;
  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <span>{id}</span>
      </Breadcrumbs>
      <div className={styles.status}>
        <StatusTag status={status} />
      </div>
      <div className={styles.header}>
        <div className={styles.customer}>
          <h2 className={styles.customerName}>
            {formatCustomerName(customer)}
          </h2>
          <Zone name={parkingZone.name} />
        </div>
        <div className={styles.summary}>
          <b>{t(`${T_PATH}.residentParkingPermit`)}</b>{' '}
          <span>
            {t(`${T_PATH}.permitId`)}: {id}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <VehicleInfo className={styles.vehicleInfo} permit={permitDetail} />
        <CustomerInfo className={styles.customerInfo} permit={permitDetail} />
        <PermitInfo className={styles.permitInfo} permit={permitDetail} />
      </div>
      <div className={styles.changeLogs}>
        <div className={styles.changeLogsTitle}>
          {t(`${T_PATH}.changeHistory`)}
        </div>
        <ChangeLogs changeLogs={changeLogs} />
      </div>
    </div>
  );
};
export default makePrivate(PermitDetail);
