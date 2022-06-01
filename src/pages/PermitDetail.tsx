import { gql, useQuery } from '@apollo/client';
import { Button, IconDownload, IconPenLine, Notification } from 'hds-react';
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
import useExportData from '../export/useExportData';
import { formatExportUrlPdf } from '../export/utils';
import { PermitDetailData, PermitEndType } from '../types';
import { formatCustomerName } from '../utils';
import styles from './PermitDetail.module.scss';

const T_PATH = 'pages.permitDetail';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      id
      startTime
      endTime
      currentPeriodEndTime
      canEndImmediately
      canEndAfterCurrentPeriod
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      description
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
        otherAddress {
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
      }
      parkingZone {
        name
        label
        labelSv
      }
    }
  }
`;

const PermitDetail = (): React.ReactElement => {
  const navigate = useNavigate();
  const exportData = useExportData();
  const params = useParams();
  const { t } = useTranslation();
  const [openEndPermitDialog, setOpenEndPermitDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { id } = params;
  const variables = { permitId: id };
  const { loading, data } = useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(error.message),
  });
  const handleExport = () => {
    const url = formatExportUrlPdf('permit', id || '');
    exportData(url);
  };

  let content = null;
  if (loading || !data) {
    content = <div>loading...</div>;
  } else {
    const { permitDetail } = data;
    const {
      status,
      customer,
      parkingZone,
      changeLogs,
      currentPeriodEndTime,
      canEndImmediately,
      canEndAfterCurrentPeriod,
    } = permitDetail;
    content = (
      <>
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
            className={styles.actionButton}
            variant="secondary"
            iconLeft={<IconDownload />}
            onClick={handleExport}>
            {t(`${T_PATH}.downloadPdf`)}
          </Button>
          <div className={styles.spacer} />
          <Button
            className={styles.cancelButton}
            variant="secondary"
            disabled={!canEndImmediately}
            onClick={() => setOpenEndPermitDialog(true)}>
            {t(`${T_PATH}.endPermit`)}
          </Button>
        </div>
        <EndPermitDialog
          isOpen={openEndPermitDialog}
          currentPeriodEndTime={currentPeriodEndTime}
          canEndAfterCurrentPeriod={canEndAfterCurrentPeriod}
          onCancel={() => setOpenEndPermitDialog(false)}
          onConfirm={(endType: PermitEndType) =>
            navigate(`end/${endType.toLowerCase()}`)
          }
        />
      </>
    );
  }

  return (
    <div className={styles.container}>
      {content}
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
export default makePrivate(PermitDetail);
