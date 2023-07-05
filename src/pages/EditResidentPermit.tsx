import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EditResidentPermitForm from '../components/residentPermit/EditResidentPermitForm';
import EditResidentPermitPreview from '../components/residentPermit/EditResidentPermitPreview';
import {
  MutationResponse,
  PermitDetail,
  PermitDetailData,
  PermitPrice,
  PermitPriceChange,
} from '../types';
import {
  convertAddressToAddressInput,
  convertToPermitInput,
  isValidForPriceCheck,
} from '../utils';
import styles from './EditResidentPermit.module.scss';

const T_PATH = 'pages.editResidentPermit';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      id
      startTime
      endTime
      primaryVehicle
      currentPeriodEndTime
      canEndImmediately
      canEndAfterCurrentPeriod
      status
      consentLowEmissionAccepted
      contractType
      monthCount
      description
      permitPrices {
        originalUnitPrice
        unitPrice
        startDate
        endDate
        quantity
      }
      address {
        id
        zone {
          name
        }
      }
      addressApartment
      customer {
        firstName
        lastName
        nationalIdNumber
        email
        phoneNumber
        addressSecurityBan
        driverLicenseChecked
        primaryAddress {
          id
          streetName
          streetNameSv
          streetNumber
          city
          citySv
          postalCode
          location
          zone {
            name
            label
            labelSv
          }
        }
        primaryAddressApartment
        otherAddress {
          id
          streetName
          streetNameSv
          streetNumber
          city
          citySv
          postalCode
          location
          zone {
            name
            label
            labelSv
          }
        }
        otherAddressApartment
        activePermits {
          id
          primaryVehicle
        }
      }
      vehicle {
        manufacturer
        model
        registrationNumber
        isLowEmission
        consentLowEmissionAccepted
        serialNumber
        vehicleClass
        euroClass
        emission
        emissionType
        powerType {
          name
          identifier
        }
      }
      parkingZone {
        name
        label
        labelSv
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

const PERMIT_PRICES_QUERY = gql`
  query GetPermitPrices($permit: ResidentPermitInput!, $isSecondary: Boolean!) {
    permitPrices(permit: $permit, isSecondary: $isSecondary) {
      originalUnitPrice
      unitPrice
      startDate
      endDate
      quantity
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
  const [permitPrices, setPermitPrices] = useState<PermitPrice[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [priceChangeList, setPriceChangeList] = useState<
    PermitPriceChange[] | null
  >(null);
  const [refundAccountNumber, setRefundAccountNumber] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // graphql queries and mutations
  useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables: { permitId },
    fetchPolicy: 'no-cache',
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
      setPermitPrices(permitDetail.permitPrices);
    },
    onError: error => setErrorMessage(error.message),
  });

  const [getPermitPriceChangeList] = useLazyQuery<{
    permitPriceChangeList: PermitPriceChange[];
  }>(PERMIT_PRICE_CHANGE_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: data => setPriceChangeList(data.permitPriceChangeList),
    onError: error => setErrorMessage(error.message),
  });

  const [getPermitPrices] = useLazyQuery<{ permitPrices: PermitPrice[] }>(
    PERMIT_PRICES_QUERY,
    {
      onCompleted: data => {
        setPermitPrices(data.permitPrices);
      },
      onError: error => setErrorMessage(error.message),
    }
  );

  const [updateResidentPermit] = useMutation<MutationResponse>(
    UPDATE_RESIDENT_PERMIT_MUTATION,
    {
      onCompleted: () => navigate('/permits'),
      onError: error => setErrorMessage(error.message),
    }
  );

  const updatePermitPrices = (
    newPermit: PermitDetail,
    isSecondary: boolean
  ) => {
    const permitInput = convertToPermitInput(newPermit);
    if (isValidForPriceCheck(permitInput)) {
      getPermitPrices({ variables: { permit: permitInput, isSecondary } });
    }
  };

  if (!permit) {
    return <div>{t(`${T_PATH}.loading`)}</div>;
  }

  const handleUpdatePermit = () => {
    updateResidentPermit({
      variables: {
        permitId,
        permitInfo: {
          ...convertToPermitInput(permit),
          address: convertAddressToAddressInput(permit.address),
          zone: permit.parkingZone?.name,
        },
        iban: refundAccountNumber,
      },
    });
  };

  const totalPriceChange = priceChangeList
    ? priceChangeList.reduce(
        (total, item) => total + item.priceChange * item.monthCount,
        0
      )
    : null;

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
          permitPrices={permitPrices}
          onUpdatePermit={updatedPermit => {
            setPermit(updatedPermit);
            updatePermitPrices(updatedPermit, !updatedPermit.primaryVehicle);
          }}
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
          refundAccountNumber={refundAccountNumber}
          onChangeRefundAccountNumber={accountNumber =>
            setRefundAccountNumber(accountNumber)
          }
          onCancel={() => {
            setShowEditPreview(false);
            setPriceChangeList(null);
          }}
          onConfirm={() => {
            if (totalPriceChange && totalPriceChange > 0) {
              // show paymore confirmation dialog if
              // extra payment is needed
              setIsConfirmDialogOpen(true);
            } else {
              // udpate the permit directly if no
              // extra payment needed
              handleUpdatePermit();
            }
          }}
        />
      )}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={t(`${T_PATH}.confirmPaymentTitle`)}
        message={t(`${T_PATH}.confirmPaymentMessage`)}
        secondaryMessage={t(`${T_PATH}.confirmPaymentTotalAmount`, {
          amount: totalPriceChange,
        })}
        confirmLabel={t(`${T_PATH}.confirmPayment`)}
        cancelLabel={t(`${T_PATH}.cancelPayment`)}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          handleUpdatePermit();
        }}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
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
