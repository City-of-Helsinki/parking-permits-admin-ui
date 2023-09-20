import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Button, IconCheckCircleFill, Notification } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getEmptyPermit } from '../components/residentPermit/consts';
import PermitInfo from '../components/residentPermit/PermitInfo';
import PersonalInfo from '../components/residentPermit/PersonalInfo';
import VehicleInfo from '../components/residentPermit/VehicleInfo';
import {
  Address,
  CreatePermitResponse,
  Customer,
  ParkingZone,
  PermitDetail,
  PermitPrice,
  Vehicle,
} from '../types';
import {
  convertToPermitInput,
  formatPrice,
  isValidForPriceCheck,
} from '../utils';
import styles from './CreateResidentPermit.module.scss';

const T_PATH = 'pages.createResidentPermit';

const CUSTOMER_QUERY = gql`
  query GetCustomer($query: CustomerRetrieveInput!) {
    customer(query: $query) {
      firstName
      lastName
      nationalIdNumber
      email
      phoneNumber
      zone
      addressSecurityBan
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
      activePermits {
        id
        primaryVehicle
        monthCount
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

const PERMIT_PRICES_QUERY = gql`
  query GetPermitPrices($permit: ResidentPermitInput!, $isSecondary: Boolean!) {
    permitPrices(permit: $permit, isSecondary: $isSecondary) {
      unitPrice
      startDate
      endDate
      quantity
    }
  }
`;

const CREATE_RESIDENT_PERMIT_MUTATION = gql`
  mutation CreateResidentPermit($permit: ResidentPermitInput!) {
    createResidentPermit(permit: $permit) {
      success
      permit {
        id
      }
    }
  }
`;

const CreateResidentPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // states
  const initialPermit = getEmptyPermit();
  const [permit, setPermit] = useState<PermitDetail>(initialPermit);
  const [permitPrices, setPermitPrices] = useState<PermitPrice[]>([]);
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { vehicle, customer } = permit;

  // graphql queries and mutations
  const [getCustomer] = useLazyQuery<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: ({ customer: newCustomer }) => {
      setPersonSearchError('');
      const defaultAddress =
        newCustomer.primaryAddress || customer.otherAddress;
      setPermit({
        ...permit,
        customer: {
          ...newCustomer,
        },
        address: defaultAddress as Address,
        parkingZone: defaultAddress?.zone as ParkingZone,
      });
    },
    onError: error => setPersonSearchError(error.message),
  });
  const [getVehicle] = useLazyQuery<{
    vehicle: Vehicle;
  }>(VEHICLE_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      setVehicleSearchError('');
      setPermit({
        ...permit,
        vehicle: data.vehicle,
      });
    },
    onError: error => setVehicleSearchError(error.message),
  });
  const [getPermitPrices] = useLazyQuery<{ permitPrices: PermitPrice[] }>(
    PERMIT_PRICES_QUERY,
    {
      fetchPolicy: 'no-cache',
      onCompleted: data => {
        setPermitPrices(data.permitPrices);
      },
      onError: error => setErrorMessage(error.message),
    }
  );
  const [createResidentPermit] = useMutation<CreatePermitResponse>(
    CREATE_RESIDENT_PERMIT_MUTATION,
    {
      onError: error => setErrorMessage(error.message),
    }
  );

  const updatePermitPrices = (newPermit: PermitDetail) => {
    const isSecondary = newPermit.customer.activePermits?.length === 1;
    const permitInput = convertToPermitInput(newPermit);
    if (isValidForPriceCheck(permitInput)) {
      getPermitPrices({ variables: { permit: permitInput, isSecondary } });
    }
  };

  // event handlers
  const handleCreateResidentPermit = () => {
    createResidentPermit({
      variables: { permit: convertToPermitInput(permit) },
    })
      .then(response => {
        const permitId = response.data?.createResidentPermit.permit.id;
        if (permitId) {
          navigate(`/permits/${permitId}`);
        }
        if (response.errors && response.errors.message) {
          setErrorMessage(response.errors.message);
        } else {
          setErrorMessage(t(`${T_PATH}.createPermitError`));
        }
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
  const handleUpdateVehicle = (newVehicle: Vehicle) => {
    const newPermit = {
      ...permit,
      vehicle: newVehicle,
    };
    setPermit(newPermit);
    updatePermitPrices(newPermit);
  };
  const handleSearchPerson = (nationalIdNumber: string) => {
    getCustomer({
      variables: { query: { nationalIdNumber } },
    });
  };

  const handleUpdatePermit = (newPermit: PermitDetail) => {
    setPermit(newPermit);
    updatePermitPrices(newPermit);
  };

  const totalPrice = formatPrice(
    permitPrices.reduce(
      (price, permitPrice) =>
        price + permitPrice.unitPrice * permitPrice.quantity,
      0
    )
  );
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
          permitAddress={permit.address}
          className={styles.personalInfo}
          searchError={personSearchError}
          onUpdatePermit={(tempPermit: Partial<PermitDetail>) =>
            setPermit({
              ...permit,
              ...tempPermit,
            })
          }
          onSearchPerson={handleSearchPerson}
          parkingZone={permit.parkingZone}
        />
        <VehicleInfo
          vehicle={vehicle}
          permitPrices={permitPrices}
          className={styles.vehicleInfo}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateVehicle={handleUpdateVehicle}
        />
        <PermitInfo
          permit={permit}
          className={styles.permitInfo}
          onUpdatePermit={handleUpdatePermit}
        />
      </div>
      <div className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.actions}>
            <Button
              disabled={
                customer.activePermits && customer.activePermits.length >= 2
              }
              className={styles.actionButton}
              iconLeft={<IconCheckCircleFill />}
              onClick={() => setIsConfirmDialogOpen(true)}>
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
              <span className={styles.totalPriceValue}>{totalPrice}</span>
              <span className={styles.totalPriceCurrency}>€</span>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={t(`${T_PATH}.confirmPaymentTitle`)}
        message={t(`${T_PATH}.confirmPaymentMessage`)}
        secondaryMessage={t(`${T_PATH}.confirmPaymentTotalAmount`, {
          amount: totalPrice,
        })}
        confirmLabel={t(`${T_PATH}.confirmPayment`)}
        cancelLabel={t(`${T_PATH}.cancelPayment`)}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          handleCreateResidentPermit();
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
export default makePrivate(CreateResidentPermit);
