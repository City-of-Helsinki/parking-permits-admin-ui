import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Button, IconCheckCircleFill, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PermitInfo from '../components/createResidentPermit/PermitInfo';
import PersonalInfo from '../components/createResidentPermit/PersonalInfo';
import VehicleInfo from '../components/createResidentPermit/VehicleInfo';
import {
  Customer,
  MutationResponse,
  ParkingPermitStatus,
  PermitContractType,
  PermitDetail,
  PermitDetailData,
  PermitInfoDetail,
  Vehicle,
} from '../types';
import { extractPermitInfoDetail, stripTypenames } from '../utils';
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
        description
        descriptionSv
        residentPrice
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
          description
          descriptionSv
          residentPrice
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

const initialPerson: Customer = {
  firstName: '',
  lastName: '',
  addressSecurityBan: false,
  nationalIdNumber: '',
  phoneNumber: '',
  email: '',
  driverLicenseChecked: false,
};

const initialPermit: PermitInfoDetail = {
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
  startTime: new Date().toISOString(),
  status: ParkingPermitStatus.VALID,
};

const initialVehicle: Vehicle = {
  manufacturer: '',
  model: '',
  registrationNumber: '',
  isLowEmission: false,
  consentLowEmissionAccepted: false,
  serialNumber: '',
  category: 'M1',
};

const EditPermit = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const { id: permitId } = params;

  // states
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle);
  const [person, setPerson] = useState<Customer>(initialPerson);
  const [permit, setPermit] = useState<PermitInfoDetail>(initialPermit);
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // graphql queries and mutations
  useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables: { permitId },
    onCompleted: ({ permitDetail }) => {
      setVehicle(permitDetail.vehicle);
      setPerson({
        ...permitDetail.customer,
        zone: permitDetail.parkingZone,
      });
      setPermit(extractPermitInfoDetail(permitDetail));
    },
    onError: error => setErrorMessage(error.message),
  });
  const [getCustomer] = useLazyQuery<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    onCompleted: data => {
      setPersonSearchError('');
      setPerson(data.customer);
    },
    onError: error => setPersonSearchError(error.message),
  });
  const [getVehicle] = useLazyQuery<{
    vehicle: Vehicle;
  }>(VEHICLE_QUERY, {
    onCompleted: data => {
      setVehicleSearchError('');
      setVehicle(data.vehicle);
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
    const permitData: Partial<PermitDetail> = {
      ...permit,
      customer: person,
      vehicle,
    };
    updateResidentPermit({
      variables: { permitId, permitInfo: stripTypenames(permitData) },
    });
  };
  const handleSearchVehicle = (regNumber: string) => {
    if (!person.nationalIdNumber) {
      return;
    }
    getVehicle({
      variables: { regNumber, nationalIdNumber: person.nationalIdNumber },
    });
  };
  const handleUpdateVehicleField = (field: keyof Vehicle, value: unknown) => {
    setVehicle({
      ...vehicle,
      [field]: value,
    });
  };
  const handleSearchPerson = (nationalIdNumber: string) => {
    getCustomer({
      variables: { nationalIdNumber },
    });
  };
  const handleUpdatePersonField = (field: keyof Customer, value: unknown) => {
    setPerson({
      ...person,
      [field]: value,
    });
  };
  const handleUpdatePermitField = (
    field: keyof PermitInfoDetail,
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
          person={person}
          className={styles.personalInfo}
          searchError={personSearchError}
          onSearchPerson={handleSearchPerson}
          onUpdateField={handleUpdatePersonField}
        />
        <VehicleInfo
          vehicle={vehicle}
          zone={person.zone}
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
