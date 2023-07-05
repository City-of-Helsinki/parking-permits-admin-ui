import { gql, useLazyQuery } from '@apollo/client';
import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Customer, PermitDetail, PermitPrice, Vehicle } from '../../types';
import styles from './EditResidentPermitForm.module.scss';
import PermitInfo from './PermitInfo';
import PersonalInfo from './PersonalInfo';
import VehicleInfo from './VehicleInfo';

const T_PATH = 'components.residentPermit.editResidentPermitForm';

const CUSTOMER_QUERY = gql`
  query GetCustomer($query: CustomerRetrieveInput!) {
    customer(query: $query) {
      firstName
      lastName
      nationalIdNumber
      email
      phoneNumber
      zone
      driverLicenseChecked
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
        }
      }
      primaryAddressApartment
      otherAddress {
        city
        citySv
        streetName
        streetNumber
        postalCode
        zone {
          name
          label
          labelSv
        }
      }
      otherAddressApartment
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
      vehicleClass
      euroClass
      emission
      emissionType
      powerType {
        name
        identifier
      }
    }
  }
`;

interface EditResidentPermitFormProps {
  className?: string;
  permit: PermitDetail;
  permitPrices: PermitPrice[];
  onUpdatePermit: (permit: PermitDetail) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditResidentPermitForm = ({
  className,
  permit,
  permitPrices,
  onUpdatePermit,
  onCancel,
  onConfirm,
}: EditResidentPermitFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const { customer, vehicle, address: permitAddress } = permit;

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

  const handleUpdatePermit = (newPermit: PermitDetail) =>
    onUpdatePermit(newPermit);

  const handleSearchPerson = (nationalIdNumber: string) => {
    getCustomer({
      variables: { query: { nationalIdNumber } },
    }).then(response => {
      if (response.data?.customer) {
        handleUpdatePermit({
          ...permit,
          customer: response.data?.customer,
        });
      }
    });
  };

  const handleUpdateVehicle = (newVehicle: Vehicle) => {
    onUpdatePermit({
      ...permit,
      vehicle: newVehicle,
    });
  };
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <div className={styles.content}>
        <PersonalInfo
          className={styles.column}
          person={customer}
          permitAddress={permitAddress}
          searchError={personSearchError}
          parkingZone={permit.parkingZone}
          disableCustomerChange
          onSearchPerson={handleSearchPerson}
          onUpdatePermit={(tempPermit: Partial<PermitDetail>) =>
            onUpdatePermit({
              ...permit,
              ...tempPermit,
            })
          }
        />
        <VehicleInfo
          className={styles.column}
          vehicle={vehicle}
          permitPrices={permitPrices}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateVehicle={handleUpdateVehicle}
        />
        <PermitInfo
          className={styles.column}
          editMode
          permit={permit}
          onUpdatePermit={handleUpdatePermit}
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
