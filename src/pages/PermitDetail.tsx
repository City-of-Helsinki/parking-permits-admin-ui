import { gql, useQuery } from '@apollo/client';
import { Button, IconPenLine } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ChangeLogs from '../components/common/ChangeLogs';
import StatusTag from '../components/common/StatusTag';
import Zone from '../components/common/Zone';
import CustomerInfo from '../components/permitDetail/CustomerInfo';
import EndPermitDialog from '../components/permitDetail/EndPermitDialog';
import PermitInfo from '../components/permitDetail/PermitInfo';
import VehicleInfo from '../components/permitDetail/VehicleInfo';
import { PermitDetailData, PermitEndType } from '../types';
import { formatCustomerName } from '../utils';
import styles from './PermitDetail.module.scss';

const T_PATH = 'pages.permitDetail';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      identifier
      startTime
      endTime
      currentPeriodEndTime
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
          city
          citySv
          postalCode
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
        residentPrice
      }
    }
  }
`;

const PermitDetail = (): React.ReactElement => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const [openEndPermitDialog, setOpenEndPermitDialog] = useState(false);
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
  const { status, customer, parkingZone, changeLogs, currentPeriodEndTime } =
    permitDetail;
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
      <div className={styles.footer}>
        <Button
          className={styles.actionButton}
          iconLeft={<IconPenLine />}
          onClick={() => navigate('edit')}>
          {t(`${T_PATH}.edit`)}
        </Button>
        <div className={styles.spacer} />
        <Button
          className={styles.cancelButton}
          variant="secondary"
          onClick={() => setOpenEndPermitDialog(true)}>
          {t(`${T_PATH}.endPermit`)}
        </Button>
      </div>
      <EndPermitDialog
        isOpen={openEndPermitDialog}
        currentPeriodEndTime={currentPeriodEndTime}
        onCancel={() => setOpenEndPermitDialog(false)}
        onConfirm={(endType: PermitEndType) =>
          navigate(`end/${endType.toLowerCase()}`)
        }
      />
    </div>
  );
};
export default makePrivate(PermitDetail);
