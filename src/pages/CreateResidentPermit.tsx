import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Button, IconCheckCircleFill, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  PermitDetail,
  Vehicle,
} from '../types';
import { convertToPermitInput, getPermitTotalPrice } from '../utils';
import styles from './CreateResidentPermit.module.scss';

const T_PATH = 'pages.createResidentPermit';

const CUSTOMER_QUERY = gql`
  query GetCustomer($nationalIdNumber: String!) {
    customer(nationalIdNumber: $nationalIdNumber) {
      firstName
      lastName
      nationalIdNumber
      email
      phoneNumber
      zone
      addressSecurityBan
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

const CREATE_RESIDENT_PERMIT_MUTATION = gql`
  mutation CreateResidentPermit($permit: ResidentPermitInput!) {
    createResidentPermit(permit: $permit) {
      success
    }
  }
`;

const CreateResidentPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // states
  const [permit, setPermit] = useState<EditPermitDetail>(initialPermit);
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { vehicle, customer } = permit;

  // graphql queries and mutations
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
  const [createResidentPermit] = useMutation<MutationResponse>(
    CREATE_RESIDENT_PERMIT_MUTATION,
    {
      onError: error => setErrorMessage(error.message),
    }
  );

  // event handlers
  const handleCreateResidentPermit = () => {
    createResidentPermit({
      variables: { permit: convertToPermitInput(permit) },
    })
      .then(() => {
        navigate('/permits');
      })
      .catch(error => setErrorMessage(error.message));
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
      ...permit.customer,
      [field]: value,
    };
    setPermit({
      ...permit,
      customer: newCustomer,
    });
  };
  const handleUpdatePermitField = (field: keyof PermitDetail, value: unknown) =>
    setPermit({
      ...permit,
      [field]: value,
    });

  const formatTotalPrice = () => {
    if (permit.customer.zone?.residentProducts && permit) {
      const startDate = new Date(permit.startTime);
      return getPermitTotalPrice(
        permit.customer.zone.residentProducts,
        startDate,
        permit.monthCount,
        {
          isLowEmission: permit.vehicle.isLowEmission,
          isSecondaryVehicle: false,
        }
      );
    }
    return '-';
  };
  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <Link to="/create">{t(`${T_PATH}.createNewPermit`)}</Link>
        <span>{t(`${T_PATH}.residentPermit`)}</span>
      </Breadcrumbs>
      <div className={styles.title}>{t(`${T_PATH}.residentPermit`)}</div>
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
          permit={permit}
          className={styles.permitInfo}
          onUpdateField={handleUpdatePermitField}
        />
      </div>
      <div className={styles.footer}>
        <div className={styles.actions}>
          <Button
            className={styles.actionButton}
            iconLeft={<IconCheckCircleFill />}
            onClick={handleCreateResidentPermit}>
            {t(`${T_PATH}.save`)}
          </Button>
          <Button
            className={styles.actionButton}
            variant="secondary"
            onClick={() => navigate('/permits')}>
            {t(`${T_PATH}.cancelAndCloseWithoutSaving`)}
          </Button>
        </div>
        <div className={styles.priceInfo}>
          <div className={styles.priceLabel}>{t(`${T_PATH}.totalPrice`)}</div>
          <div className={styles.totalPrice}>
            <span className={styles.totalPriceValue}>{formatTotalPrice()}</span>
            <span className={styles.totalPriceCurrency}>€</span>
          </div>
        </div>
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
export default makePrivate(CreateResidentPermit);
