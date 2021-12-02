import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PermitInfo from '../components/createResidentPermit/PermitInfo';
import PersonalInfo from '../components/createResidentPermit/PersonalInfo';
import VehicleInfo from '../components/createResidentPermit/VehicleInfo';
import {
  Customer,
  FixedPeriodResidentPermit,
  MutationResponse,
  ParkingPermitStatus,
  PermitContractType,
  ResidentPermit,
  Vehicle,
} from '../types';
import { formatMonthlyPrice } from '../utils';
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
      zone {
        name
        description
        descriptionSv
        residentPrice
      }
      primaryAddress {
        city
        citySv
        streetName
        streetNumber
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

const CREATE_RESIDENT_PERMIT_MUTATION = gql`
  mutation CreateResidentPermit($permit: ResidentPermitInput!) {
    createResidentPermit(permit: $permit) {
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

const initialPermit: FixedPeriodResidentPermit = {
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

const CreateResidentPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // states
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle);
  const [person, setPerson] = useState<Customer>(initialPerson);
  const [permit, setPermit] =
    useState<FixedPeriodResidentPermit>(initialPermit);

  // graphql queries and mutations
  const [getCustomer] = useLazyQuery<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    onCompleted: data => setPerson(data.customer),
    onError: error => console.log(error.message),
  });
  const [getVehicle] = useLazyQuery<{
    vehicle: Vehicle;
  }>(VEHICLE_QUERY, {
    onCompleted: data => setVehicle(data.vehicle),
    onError: error => console.log(error.message),
  });
  const [createResidentPermit] = useMutation<MutationResponse>(
    CREATE_RESIDENT_PERMIT_MUTATION
  );

  // event handlers
  const handleCreateResidentPermit = () => {
    if (!vehicle || !person || !person.zone) {
      return;
    }
    const permitData: ResidentPermit = {
      ...permit,
      customer: person,
      vehicle,
    };
    createResidentPermit({ variables: { permit: permitData } }).then(() => {
      navigate('/permits');
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
    field: keyof FixedPeriodResidentPermit,
    value: unknown
  ) =>
    setPermit({
      ...permit,
      [field]: value,
    });

  const formatDetailPrice = () => {
    if (person?.zone && permit) {
      const amountLabel = t(`${T_PATH}.monthCount`, {
        count: permit.monthCount,
      });
      const price = vehicle?.isLowEmission
        ? person.zone.residentPrice / 2
        : person.zone.residentPrice;
      const unitPriceLabel = formatMonthlyPrice(price);
      return `${amountLabel}, ${unitPriceLabel}`;
    }
    return '-';
  };
  const formatTotalPrice = () => {
    if (person?.zone && permit) {
      const price = vehicle?.isLowEmission
        ? person.zone.residentPrice / 2
        : person.zone.residentPrice;
      return permit.monthCount * price;
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
          person={person}
          className={styles.personalInfo}
          onSearchPerson={handleSearchPerson}
          onUpdateField={handleUpdatePersonField}
        />
        <VehicleInfo
          vehicle={vehicle}
          zone={person?.zone}
          className={styles.vehicleInfo}
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
          <div className={styles.priceLabel}>
            <div className={styles.totalPriceLabel}>
              {t(`${T_PATH}.totalPrice`)}
            </div>
            <div className={styles.priceDetail}>{formatDetailPrice()}</div>
          </div>
          <div className={styles.totalPrice}>
            <span className={styles.totalPriceValue}>{formatTotalPrice()}</span>
            <span className={styles.totalPriceCurrency}>€</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default makePrivate(CreateResidentPermit);
