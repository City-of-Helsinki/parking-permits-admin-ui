import { gql, useLazyQuery } from '@apollo/client';
import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Address,
  Customer,
  PermitDetail,
  PermitPrice,
  Vehicle,
} from '../../types';
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
      addressSecurityBan
      email
      phoneNumber
      zone
      driverLicenseChecked
      primaryAddress {
        id
        city
        citySv
        streetName
        streetNumber
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
        city
        citySv
        streetName
        streetNumber
        postalCode
        location
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
      restrictions
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
  onResetPermit: (nationalIdNumber: string) => void;
  onResetVehicle: (regNumber: string) => void;
  onClearVehicle: () => void;
  onUpdatePermit: (permit: PermitDetail) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditResidentPermitForm = ({
  className,
  permit,
  permitPrices,
  onResetPermit,
  onResetVehicle,
  onClearVehicle,
  onUpdatePermit,
  onCancel,
  onConfirm,
}: EditResidentPermitFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const {
    customer,
    vehicle,
    address: permitAddress,
    disableVehicleFields,
  } = permit;
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
        disableVehicleFields: true,
      });
    },
    onError: error => setVehicleSearchError(error.message),
  });

  const handleSearchVehicle = (regNumber: string) => {
    if (!customer.nationalIdNumber) {
      return;
    }
    onResetVehicle(regNumber);
    getVehicle({
      variables: { regNumber, nationalIdNumber: customer.nationalIdNumber },
    });
  };

  const handleClearVehicle = () => {
    setVehicleSearchError('');
    onClearVehicle();
  };

  const handleUpdatePermit = (newPermit: PermitDetail) =>
    onUpdatePermit(newPermit);

  const handleSearchPerson = (
    nationalIdNumber: string,
    email: string,
    phoneNumber: string
  ) => {
    const { address: originalAddress } = permit;

    onResetPermit(nationalIdNumber);
    getCustomer({
      variables: { query: { nationalIdNumber } },
    }).then(response => {
      if (response.data?.customer) {
        const {
          primaryAddress,
          primaryAddressApartment,
          otherAddress,
          otherAddressApartment,
        } = response.data?.customer;

        let address = null;
        let addressApartment = '';

        if (
          !!otherAddress &&
          !!originalAddress &&
          otherAddress.id === originalAddress.id
        ) {
          address = otherAddress;
          addressApartment = otherAddressApartment ?? '';
        } else {
          address = primaryAddress;
          addressApartment = primaryAddressApartment ?? '';
        }

        let fields = {
          ...permit,
          customer: {
            ...response.data?.customer,
            email,
            phoneNumber,
          },
        };

        if (address) {
          const parkingZone = address.zone ?? {
            name: '',
            label: '',
            labelSv: '',
          };

          fields = {
            ...fields,
            address,
            addressApartment,
            parkingZone,
          };
        }

        handleUpdatePermit(fields);
      }
    });
  };

  const handleUpdateVehicle = (newVehicle: Vehicle) => {
    onUpdatePermit({
      ...permit,
      vehicle: newVehicle,
    });
  };
  // ensure address has all correct fields
  const handleSelectAddress = (
    address: Address | undefined,
    apartment: string | undefined
  ) => {
    if (!!address && address.id && address.zone) {
      const { address: currentAddress, addressApartment: currentApartment } =
        permit;
      if (currentAddress?.id === address.id) {
        onUpdatePermit({
          ...permit,
          address,
          addressApartment: currentApartment ?? apartment ?? '',
          parkingZone: address.zone,
        });
      }
    }
  };

  const updateAddress = () => {
    const { address: currentAddress } = permit;
    onUpdatePermit({
      ...permit,
      address: currentAddress ?? permit?.customer?.primaryAddress,
    });
    handleSelectAddress(
      permit?.customer?.otherAddress,
      permit?.customer?.otherAddressApartment
    );
    handleSelectAddress(
      permit?.customer?.primaryAddress,
      permit?.customer?.primaryAddressApartment
    );
  };

  const handleConfirm = () => {
    updateAddress();
    onConfirm();
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
          disableVehicleFields={disableVehicleFields}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onClearVehicle={handleClearVehicle}
        />
        <PermitInfo
          className={styles.column}
          editMode
          permit={permit}
          permitPrices={permitPrices}
          onUpdatePermit={handleUpdatePermit}
        />
      </div>
      <div className={styles.footer}>
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
            onClick={handleConfirm}>
            {t(`${T_PATH}.continue`)}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default EditResidentPermitForm;
