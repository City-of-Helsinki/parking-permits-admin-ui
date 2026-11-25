import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, ButtonVariant, IconArrowLeft, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router';
import makePrivate from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CustomerInfo from '../components/permitDetail/CustomerInfo';
import PermitInfo from '../components/permitDetail/PermitInfo';
import RefundInfo from '../components/permitDetail/RefundInfo';
import VehicleInfo from '../components/permitDetail/VehicleInfo';
import {
  MutationResponse,
  PermitContractType,
  PermitDetailData,
  PermitEndType,
} from '../types';
import { getApolloErrorMessage, isValidIBAN } from '../utils';
import styles from './EndPermit.module.scss';

const T_PATH = 'pages.endPermit';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      id
      startTime
      endTime
      currentPeriodEndTime
      canBeRefunded
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      monthsLeft
      totalRefundAmount
      addressApartment
      primaryVehicle
      customer {
        activePermits {
          id
          primaryVehicle
          contractType
        }
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
        primaryAddressApartment
        otherAddress {
          streetName
          streetNameSv
          streetNumber
          city
          citySv
          postalCode
        }
        otherAddressApartment
      }
      vehicle {
        manufacturer
        model
        registrationNumber
        isLowEmission
        updatedFromTraficomOn
      }
      parkingZone {
        name
        label
        labelSv
      }
    }
  }
`;

const END_PERMIT_MUTATION = gql`
  mutation endPermit($permitId: ID!, $endType: PermitEndType!, $iban: String) {
    endPermit(permitId: $permitId, endType: $endType, iban: $iban) {
      success
    }
  }
`;

const EndPermit = (): React.ReactElement => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { id, endType } = params;
  const variables = { permitId: id };
  const [iban, setIban] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { loading, data } = useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables,
    fetchPolicy: 'no-cache',
    onError: error => setErrorMessage(getApolloErrorMessage(error)),
  });
  const [endPermit] = useMutation<MutationResponse>(END_PERMIT_MUTATION);
  if (loading || !data) {
    return <div>{t(`${T_PATH}.loading`)}</div>;
  }
  const { permitDetail } = data;
  const {
    id: permitId,
    contractType,
    canBeRefunded,
    totalRefundAmount,
  } = permitDetail;
  const showRefund =
    contractType === PermitContractType.FIXED_PERIOD || canBeRefunded;
  const isRefundAmountMissing = totalRefundAmount === null;
  const hasPositiveRefundAmount =
    totalRefundAmount !== null && totalRefundAmount > 0;
  const requiresIban =
    canBeRefunded &&
    hasPositiveRefundAmount &&
    iban !== '' &&
    !isValidIBAN(iban);
  const isEndPermitDisabled =
    isRefundAmountMissing || (showRefund && requiresIban);
  const successor =
    permitDetail.primaryVehicle &&
    contractType === PermitContractType.OPEN_ENDED &&
    endType?.toUpperCase() === PermitEndType.IMMEDIATELY &&
    permitDetail.customer.activePermits?.find(
      p => !p.primaryVehicle && p.contractType === PermitContractType.OPEN_ENDED
    );
  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <Link to={`/permits/${id}`}>{id}</Link>
        <span>{t(`${T_PATH}.endPermit`)}</span>
      </Breadcrumbs>
      <div className={styles.header}>
        <h2 className={styles.title}>{t(`${T_PATH}.title`)}</h2>
        <div className={styles.summary}>
          <b>{t(`${T_PATH}.residentParkingPermit`)}</b>{' '}
          <span>
            {t(`${T_PATH}.permitId`)}: {id}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.column}>
          <VehicleInfo className={styles.vehicleInfo} permit={permitDetail} />
          <CustomerInfo className={styles.customerInfo} permit={permitDetail} />
        </div>
        <PermitInfo
          className={styles.column}
          endType={
            endType ? (endType.toUpperCase() as PermitEndType) : undefined
          }
          permit={permitDetail}
        />
        {(showRefund || isRefundAmountMissing) && (
          <RefundInfo
            className={styles.column}
            iban={iban}
            permit={permitDetail}
            onChangeIban={newIban => setIban(newIban)}
          />
        )}
      </div>
      {successor && (
        <Notification type="info">
          {t(`${T_PATH}.promoteSecondary`, { id: successor.id })}
        </Notification>
      )}
      <div className={styles.actions}>
        <Button
          className={styles.cancelButton}
          variant={ButtonVariant.Secondary}
          iconStart={<IconArrowLeft />}
          onClick={() => navigate(`/permits/${id}`)}>
          {t(`${T_PATH}.cancel`)}
        </Button>
        <div className={styles.spacer} />
        <Button
          className={styles.actionButton}
          disabled={isEndPermitDisabled}
          onClick={() => {
            endPermit({
              variables: {
                permitId,
                endType: endType?.toUpperCase(),
                iban,
              },
            })
              .then(() => navigate(`/permits/${id}`))
              .catch(e => {
                setErrorMessage(e.message);
              });
          }}>
          {t(`${T_PATH}.endPermit`)}
        </Button>
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
export default makePrivate(EndPermit);
