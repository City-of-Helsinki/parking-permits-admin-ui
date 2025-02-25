import { gql, useLazyQuery, useMutation } from '@apollo/client';
import {
  Button,
  IconArrowUndo,
  IconBox,
  IconPlusCircleFill,
  Notification,
} from 'hds-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  getEmptyPermit,
  initialVehicle,
} from '../components/residentPermit/consts';
import PermitInfo from '../components/residentPermit/PermitInfo';
import PersonalInfo from '../components/residentPermit/PersonalInfo';
import VehicleInfo from '../components/residentPermit/VehicleInfo';
import {
  Address,
  CreatePermitResponse,
  Customer,
  ParkingPermitStatus,
  ParkingZone,
  PermitDetail,
  PermitDetailData,
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
        startTime
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
      restrictions
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
      canAdminExtendPermit
      bypassTraficomValidation
      contractType
      monthCount
      description
      permitPrices {
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
        restrictions
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

const CreateResidentPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { id: permitId } = params;
  // states
  const initialPermit = getEmptyPermit();
  const [permit, setPermit] = useState<PermitDetail>(initialPermit);
  const [permitPrices, setPermitPrices] = useState<PermitPrice[]>([]);
  const [personSearchError, setPersonSearchError] = useState('');
  const [vehicleSearchError, setVehicleSearchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { vehicle, customer, disableVehicleFields } = permit;

  // graphql queries and mutations
  const [getPermit] = useLazyQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables: { permitId },
    fetchPolicy: 'no-cache',
    onCompleted: ({ permitDetail }) => {
      // permit parking zone should override customer
      // zone as pre-selected value
      const newCustomer = {
        ...permitDetail.customer,
        zone: permitDetail.parkingZone,
      };
      setPermit({
        ...permitDetail,
        customer: newCustomer,
        disableVehicleFields: true,
      });
      setPermitPrices(permitDetail.permitPrices);
    },
    onError: error => setErrorMessage(error.message),
  });

  useEffect(() => {
    if (permitId) {
      getPermit({ variables: { permitId } });
    }
  }, [permitId, getPermit]);

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
        disableVehicleFields: true,
      });
    },
    onError: error => {
      setVehicleSearchError(error.message);
      setPermit({
        ...permit,
        disableVehicleFields: false,
      });
    },
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
    setPermit({
      ...permit,
      status: ParkingPermitStatus.VALID,
    });
    createResidentPermit({
      variables: {
        permit: convertToPermitInput({
          ...permit,
          status: ParkingPermitStatus.VALID,
        }),
      },
    })
      .then(response => {
        const id = response.data?.createResidentPermit?.permit?.id;
        if (id) {
          navigate(`/permits/${id}`);
        }
        if (response.errors && response.errors.message) {
          setErrorMessage(response.errors.message);
        } else {
          setErrorMessage(t(`${T_PATH}.createPermitError`));
        }
      })
      .catch(error => setErrorMessage(error.message));
  };

  const handleCreateDraftResidentPermit = () => {
    if (
      !(
        permit.status === ParkingPermitStatus.DRAFT ||
        permit.status === ParkingPermitStatus.PRELIMINARY
      )
    ) {
      setPermit({
        ...permit,
        status: ParkingPermitStatus.DRAFT,
      });
      permit.status = ParkingPermitStatus.DRAFT;
    }
    createResidentPermit({
      variables: {
        permit: convertToPermitInput(permit),
      },
    })
      .then(response => {
        const id = response.data?.createResidentPermit?.permit?.id;
        if (id) {
          setInfoMessage(
            t(`${T_PATH}.draftPermitSaved`, {
              permitId: id,
            })
          );
        }
      })
      .catch(error => setErrorMessage(error.message));
  };

  const handleSearchVehicle = (regNumber: string) => {
    if (!customer.nationalIdNumber) {
      return;
    }
    setPermit({
      ...permit,
      vehicle: { ...initialVehicle, registrationNumber: regNumber },
    });
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

  const handleClearVehicle = () => {
    setVehicleSearchError('');
    const newPermit = {
      ...permit,
      vehicle: initialVehicle,
    };
    setPermit({
      ...permit,
      vehicle: initialVehicle,
      disableVehicleFields: false,
    });
    updatePermitPrices(newPermit);
  };

  const handleSearchPerson = (nationalIdNumber: string) => {
    const emptyPermit = getEmptyPermit();
    setPermit({
      ...emptyPermit,
      customer: { ...emptyPermit.customer, nationalIdNumber },
    });
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

  const { activePermits } = customer;
  let minStartDate = new Date();
  if (activePermits && activePermits.length > 0) {
    const startTime = new Date(activePermits[0].startTime);
    minStartDate = startTime > minStartDate ? startTime : minStartDate;
    permit.startTime = minStartDate.toISOString();
  }

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
          disableVehicleFields={disableVehicleFields}
          className={styles.vehicleInfo}
          searchError={vehicleSearchError}
          onSearchRegistrationNumber={handleSearchVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onClearVehicle={handleClearVehicle}
        />
        <PermitInfo
          permit={permit}
          permitPrices={permitPrices}
          className={styles.permitInfo}
          onUpdatePermit={handleUpdatePermit}
          minStartDate={minStartDate}
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
              iconLeft={<IconPlusCircleFill />}
              onClick={() => setIsConfirmDialogOpen(true)}>
              {t(`${T_PATH}.save`)}
            </Button>
            <Button
              disabled={
                customer.activePermits && customer.activePermits.length >= 2
              }
              className={styles.actionButton}
              variant="secondary"
              iconLeft={<IconBox />}
              onClick={handleCreateDraftResidentPermit}>
              {t(`${T_PATH}.saveAsDraft`)}
            </Button>
            <Button
              className={styles.actionButton}
              variant="secondary"
              iconLeft={<IconArrowUndo />}
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
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
      {infoMessage && (
        <Notification
          type="success"
          label={t('message.info')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setInfoMessage('')}
          style={{ zIndex: 100, opacity: 1 }}>
          {infoMessage}
        </Notification>
      )}
    </div>
  );
};
export default makePrivate(CreateResidentPermit);
