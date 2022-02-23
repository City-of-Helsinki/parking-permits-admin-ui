import { gql, useLazyQuery } from '@apollo/client';
import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Customer, PermitDetail, Vehicle } from '../../types';
import styles from './EditResidentPermitForm.module.scss';
import PermitInfo from './PermitInfo';
import PersonalInfo from './PersonalInfo';
import VehicleInfo from './VehicleInfo';

const T_PATH = 'components.residentPermit.editResidentPermitForm';

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

interface EditResidentPermitFormProps {
  className?: string;
  permit: PermitDetail;
  onUpdatePermit: (permit: PermitDetail) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditResidentPermitForm = ({
  className,
  permit,
  onUpdatePermit,
  onCancel,
  onConfirm,
}: EditResidentPermitFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const { customer, vehicle } = permit;

  const [getCustomer] = useLazyQuery<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    onCompleted: data => {
      setPersonSearchError('');
      onUpdatePermit({
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
      onUpdatePermit({
        ...permit,
        vehicle: data.vehicle,
      });
    },
    onError: error => setVehicleSearchError(error.message),
  });

  const handleSearchVehicle = (regNumber: string) => {
    if (!customer.nationalIdNumber) {
      return;
    }
    getVehicle({
      variables: { regNumber, nationalIdNumber: customer.nationalIdNumber },
    });
  };

  const handleSearchPerson = (nationalIdNumber: string) => {
    getCustomer({
      variables: { nationalIdNumber },
    });
  };

  const handleUpdateVehicleField = (field: keyof Vehicle, value: unknown) => {
    const newVehicle = {
      ...vehicle,
      [field]: value,
    };
    onUpdatePermit({
      ...permit,
      vehicle: newVehicle,
    });
  };
  const handleUpdatePersonField = (field: keyof Customer, value: unknown) => {
    const newCustomer = {
      ...customer,
      [field]: value,
    };
    onUpdatePermit({
      ...permit,
      customer: newCustomer,
    });
  };
  const handleUpdatePermitField = (field: keyof PermitDetail, value: unknown) =>
    onUpdatePermit({
      ...permit,
      [field]: value,
    });
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <PersonalInfo
          className={styles.column}
          person={customer}
          searchError={personSearchError}
          onSearchPerson={handleSearchPerson}
          onUpdateField={handleUpdatePersonField}
        />
        <VehicleInfo
          className={styles.column}
          vehicle={vehicle}
          zone={customer.zone}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateField={handleUpdateVehicleField}
        />
        <PermitInfo
          className={styles.column}
          editMode
          permit={permit}
          onUpdateField={handleUpdatePermitField}
        />
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.actionButton}
          variant="secondary"
          onClick={() => onCancel()}>
          {t(`${T_PATH}.cancelAndCloseWithoutSaving`)}
        </Button>
        <Button
          className={styles.actionButton}
          iconLeft={<IconCheckCircleFill />}
          onClick={() => onConfirm()}>
          {t(`${T_PATH}.continue`)}
        </Button>
      </div>
    </div>
  );
};
export default EditResidentPermitForm;
