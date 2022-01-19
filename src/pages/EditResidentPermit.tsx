import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Button, IconCheckCircleFill, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { initialPermit } from '../components/residentPermit/consts';
import PermitInfo from '../components/residentPermit/PermitInfo';
import PersonalInfo from '../components/residentPermit/PersonalInfo';
import VehicleInfo from '../components/residentPermit/VehicleInfo';
import {
  Customer,
  EditPermitDetail,
  MutationResponse,
  PermitDetailData,
  Vehicle,
} from '../types';
import { convertToPermitInput } from '../utils';
import styles from './EditResidentPermit.module.scss';

const T_PATH = 'pages.editPermit';

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

const CUSTOMER_QUERY = gql`
  query GetCustomer($nationalIdNumber: String!) {
    customer(nationalIdNumber: $nationalIdNumber) {
      firstName
      lastName
      nationalIdNumber
      email
      phoneNumber
      zone
      primaryAddress {
        city
        citySv
        streetName
        streetNumber
        postalCode
        zone {
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
  }
`;

const VEHICLE_QUERY = gql`
  query GetVehicle($regNumber: String!, $nationalIdNumber: String!) {
    vehicle(regNumber: $regNumber, nationalIdNumber: $nationalIdNumber) {
      manufacturer
      model
      registrationNumber
      isLowEmission
      consentLowEmissionAccepted
      serialNumber
      category
    }
  }
`;

const UPDATE_RESIDENT_PERMIT_MUTATION = gql`
  mutation UpdateResidentPermit(
    $permitId: ID!
    $permitInfo: ResidentPermitInput!
  ) {
    updateResidentPermit(permitId: $permitId, permitInfo: $permitInfo) {
      success
    }
  }
`;

const EditPermit = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const { id: permitId } = params;

  // states
  const [permit, setPermit] = useState<EditPermitDetail>(initialPermit);
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { vehicle, customer } = permit;

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
  const [getCustomer] = useLazyQuery<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    onCompleted: data => {
      setPersonSearchError('');
      setPermit({
        ...permit,
        customer: data.customer,
      });
    },
    onError: error => setPersonSearchError(error.message),
  });
  const [getVehicle] = useLazyQuery<{
    vehicle: Vehicle;
  }>(VEHICLE_QUERY, {
    onCompleted: data => {
      setVehicleSearchError('');
      setPermit({
        ...permit,
        vehicle: data.vehicle,
      });
    },
    onError: error => setVehicleSearchError(error.message),
  });
  const [updateResidentPermit] = useMutation<MutationResponse>(
    UPDATE_RESIDENT_PERMIT_MUTATION,
    {
      onCompleted: () => navigate('/permits'),
      onError: error => setErrorMessage(error.message),
    }
  );

  // event handlers
  const handleUpdatePermit = () => {
    updateResidentPermit({
      variables: { permitId, permitInfo: convertToPermitInput(permit) },
    });
  };
  const handleSearchVehicle = (regNumber: string) => {
    if (!customer.nationalIdNumber) {
      return;
    }
    getVehicle({
      variables: { regNumber, nationalIdNumber: customer.nationalIdNumber },
    });
  };
  const handleUpdateVehicleField = (field: keyof Vehicle, value: unknown) => {
    const newVehicle = {
      ...vehicle,
      [field]: value,
    };
    setPermit({
      ...permit,
      vehicle: newVehicle,
    });
  };
  const handleSearchPerson = (nationalIdNumber: string) => {
    getCustomer({
      variables: { nationalIdNumber },
    });
  };
  const handleUpdatePersonField = (field: keyof Customer, value: unknown) => {
    const newCustomer = {
      ...customer,
      [field]: value,
    };
    setPermit({
      ...permit,
      customer: newCustomer,
    });
  };
  const handleUpdatePermitField = (
    field: keyof EditPermitDetail,
    value: unknown
  ) =>
    setPermit({
      ...permit,
      [field]: value,
    });

  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <Link to={`/permits/${permitId}`}>{permitId}</Link>
        <span>{t(`${T_PATH}.edit`)}</span>
      </Breadcrumbs>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <PersonalInfo
          person={customer}
          className={styles.personalInfo}
          searchError={personSearchError}
          onSearchPerson={handleSearchPerson}
          onUpdateField={handleUpdatePersonField}
        />
        <VehicleInfo
          vehicle={vehicle}
          zone={customer.zone}
          className={styles.vehicleInfo}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateField={handleUpdateVehicleField}
        />
        <PermitInfo
          editMode
          permit={permit}
          className={styles.permitInfo}
          onUpdateField={handleUpdatePermitField}
        />
      </div>
      <div className={styles.footer}>
        <Button
          className={styles.actionButton}
          variant="secondary"
          onClick={() => navigate('/permits')}>
          {t(`${T_PATH}.cancelAndCloseWithoutSaving`)}
        </Button>
        <Button
          className={styles.actionButton}
          iconLeft={<IconCheckCircleFill />}
          onClick={handleUpdatePermit}>
          {t(`${T_PATH}.save`)}
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
          style={{ zIndex: 100 }}>
          {errorMessage}
        </Notification>
      )}
    </div>
  );
};
export default makePrivate(EditPermit);
