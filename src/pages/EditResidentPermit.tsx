import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import EditResidentPermitForm from '../components/residentPermit/EditResidentPermitForm';
import EditResidentPermitPreview from '../components/residentPermit/EditResidentPermitPreview';
import {
  MutationResponse,
  PermitDetail,
  PermitDetailData,
  PermitPriceChange,
} from '../types';
import { convertToPermitInput } from '../utils';
import styles from './EditResidentPermit.module.scss';

const T_PATH = 'pages.editResidentPermit';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      identifier
      startTime
      endTime
      currentPeriodEndTime
      canEndImmediately
      canEndAfterCurrentPeriod
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      customer {
        firstName
        lastName
        nationalIdNumber
        email
        phoneNumber
        addressSecurityBan
        driverLicenseChecked
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
        consentLowEmissionAccepted
        serialNumber
        category
      }
      parkingZone {
        name
        label
        labelSv
        residentProducts {
          unitPrice
          startDate
          endDate
          vat
          lowEmissionDiscount
          secondaryVehicleIncreaseRate
        }
      }
    }
  }
`;

const PERMIT_PRICE_CHANGE_QUERY = gql`
  query GetPriceChangeList($permitId: ID!, $permitInfo: ResidentPermitInput!) {
    permitPriceChangeList(permitId: $permitId, permitInfo: $permitInfo) {
      product
      previousPrice
      newPrice
      priceChange
      priceChangeVat
      startDate
      endDate
      monthCount
    }
  }
`;

const UPDATE_RESIDENT_PERMIT_MUTATION = gql`
  mutation UpdateResidentPermit(
    $permitId: ID!
    $permitInfo: ResidentPermitInput!
    $iban: String
  ) {
    updateResidentPermit(
      permitId: $permitId
      permitInfo: $permitInfo
      iban: $iban
    ) {
      success
    }
  }
`;

const EditResidentPermit = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const { id: permitId } = params;

  // states
  const [permit, setPermit] = useState<PermitDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [priceChangeList, setPriceChangeList] = useState<
    PermitPriceChange[] | null
  >(null);

  // graphql queries and mutations
  useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables: { permitId },
    onCompleted: ({ permitDetail }) => {
      // permit parking zone should override customer
      // zone as pre-selected vaule
      const newCustomer = {
        ...permitDetail.customer,
        zone: permitDetail.parkingZone,
      };
      setPermit({
        ...permitDetail,
        customer: newCustomer,
      });
    },
    onError: error => setErrorMessage(error.message),
  });

  const [getPermitPriceChangeList] = useLazyQuery<{
    permitPriceChangeList: PermitPriceChange[];
  }>(PERMIT_PRICE_CHANGE_QUERY, {
    fetchPolicy: 'network-only',
    onCompleted: data => setPriceChangeList(data.permitPriceChangeList),
    onError: error => setErrorMessage(error.message),
  });

  const [updateResidentPermit] = useMutation<MutationResponse>(
    UPDATE_RESIDENT_PERMIT_MUTATION,
    {
      onCompleted: () => navigate('/permits'),
      onError: error => setErrorMessage(error.message),
    }
  );

  if (!permit) {
    return <div>{t(`${T_PATH}.loading`)}</div>;
  }

  const handleUpdatePermit = (refundAccountNumber: string) => {
    updateResidentPermit({
      variables: {
        permitId,
        permitInfo: convertToPermitInput(permit),
        iban: refundAccountNumber,
      },
    });
  };

  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <Link to={`/permits/${permitId}`}>{permitId}</Link>
        <span>{t(`${T_PATH}.edit`)}</span>
      </Breadcrumbs>
      {!showEditPreview && (
        <EditResidentPermitForm
          permit={permit}
          onUpdatePermit={updatedPermit => setPermit(updatedPermit)}
          onCancel={() => navigate('/permits')}
          onConfirm={() => {
            getPermitPriceChangeList({
              variables: { permitId, permitInfo: convertToPermitInput(permit) },
            });
            setShowEditPreview(true);
          }}
        />
      )}
      {showEditPreview && priceChangeList && (
        <EditResidentPermitPreview
          permit={permit}
          priceChangeList={priceChangeList}
          onCancel={() => {
            setShowEditPreview(false);
            setPriceChangeList(null);
          }}
          onConfirm={handleUpdatePermit}
        />
      )}
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
export default makePrivate(EditResidentPermit);
