import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, IconArrowLeft } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CustomerInfo from '../components/permitDetail/CustomerInfo';
import PermitInfo from '../components/permitDetail/PermitInfo';
import RefundInfoFixedPeriod from '../components/permitDetail/RefundInfoFixedPeriod';
import RefundInfoOpenEnded from '../components/permitDetail/RefundInfoOpenEnded';
import VehicleInfo from '../components/permitDetail/VehicleInfo';
import {
  MutationResponse,
  PermitContractType,
  PermitDetailData,
  PermitEndType,
} from '../types';
import styles from './EndPermit.module.scss';

const T_PATH = 'pages.endPermit';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      identifier
      startTime
      endTime
      currentPeriodEndTime
      hasRefund
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      monthsLeft
      monthlyPrice
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

const END_PERMIT_MUTATION = gql`
  mutation endPermit($permitId: Int!, $endType: PermitEndType!, $iban: String) {
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
  const { loading, error, data } = useQuery<PermitDetailData>(
    PERMIT_DETAIL_QUERY,
    {
      variables,
    }
  );
  const [endPermit] = useMutation<MutationResponse>(END_PERMIT_MUTATION);
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
  const { identifier, contractType, hasRefund } = permitDetail;
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
        <div className={styles.vehicleAndPerson}>
          <VehicleInfo className={styles.vehicleInfo} permit={permitDetail} />
          <CustomerInfo className={styles.customerInfo} permit={permitDetail} />
        </div>
        <PermitInfo
          className={styles.permitInfo}
          endType={
            endType ? (endType.toUpperCase() as PermitEndType) : undefined
          }
          permit={permitDetail}
        />
        {contractType === PermitContractType.FIXED_PERIOD && (
          <RefundInfoFixedPeriod
            className={styles.refundInfo}
            iban={iban}
            permit={permitDetail}
            onChangeIban={newIban => setIban(newIban)}
          />
        )}
        {contractType === PermitContractType.OPEN_ENDED && (
          <RefundInfoOpenEnded
            className={styles.refundInfo}
            permit={permitDetail}
          />
        )}
      </div>
      <div className={styles.footer}>
        <Button
          className={styles.actionButton}
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(`/permits/${id}`)}>
          {t(`${T_PATH}.cancel`)}
        </Button>
        <div className={styles.spacer} />
        <Button
          className={styles.cancelButton}
          disabled={
            contractType === PermitContractType.FIXED_PERIOD &&
            !iban &&
            !hasRefund
          }
          onClick={() => {
            endPermit({
              variables: {
                permitId: identifier,
                endType: endType?.toUpperCase(),
                iban:
                  contractType === PermitContractType.FIXED_PERIOD
                    ? iban
                    : undefined,
              },
            }).then(() => navigate(`/permits/${id}`));
          }}>
          {t(`${T_PATH}.endPermit`)}
        </Button>
      </div>
    </div>
  );
};
export default makePrivate(EndPermit);
