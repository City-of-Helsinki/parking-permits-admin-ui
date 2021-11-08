import { Button, IconCheckCircleFill } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PermitInfo from '../components/createResidentPermit/PermitInfo';
import PersonalInfo from '../components/createResidentPermit/PersonalInfo';
import VehicleInfo from '../components/createResidentPermit/VehicleInfo';
import { searchPerson, searchVechile } from '../services/mock';
import { Person, TrafiComVehicle } from '../services/types';
import {
  FixedPeriodResidentPermit,
  ParkingPermitStatus,
  PermitContractType,
} from '../types';
import { formatDate, formatMonthlyPrice } from '../utils';
import styles from './CreateResidentPermit.module.scss';

const T_PATH = 'pages.createResidentPermit';

const CreateResidentPermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchRegNumber, setSearchRegNumber] = useState('');
  const [searchPersonalId, setSearchPersonalId] = useState('');
  const [selectedVehicleUser, setSelectedVehicleUser] = useState('');
  const [vehicle, setVehicle] = useState<TrafiComVehicle>();
  const [person, setPerson] = useState<Person>();
  const [permit, setPermit] = useState<FixedPeriodResidentPermit>({
    contractType: PermitContractType.FIXED_PERIOD,
    monthCount: 1,
    startTime: formatDate(new Date()),
    status: ParkingPermitStatus.VALID,
  });
  const handleSearchVehicle = (regNumber: string) => {
    searchVechile(regNumber).then(resultVehicle => setVehicle(resultVehicle));
  };
  const handleUpdateVehicleField = (
    field: keyof TrafiComVehicle,
    value: unknown
  ) => {
    if (vehicle) {
      setVehicle({
        ...vehicle,
        [field]: value,
      });
    }
  };
  const handleSearchPerson = (personalId: string) => {
    searchPerson(personalId).then(resultPerson => setPerson(resultPerson));
  };
  const handleUpdatePersonField = (field: keyof Person, value: unknown) => {
    if (person) {
      setPerson({
        ...person,
        [field]: value,
      });
    }
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
        ? person.zone.price / 2
        : person.zone.price;
      const unitPriceLabel = formatMonthlyPrice(price);
      return `${amountLabel}, ${unitPriceLabel}`;
    }
    return '-';
  };
  const formatTotalPrice = () => {
    if (person?.zone && permit) {
      const price = vehicle?.isLowEmission
        ? person.zone.price / 2
        : person.zone.price;
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
        <VehicleInfo
          vehicle={vehicle}
          zone={person?.zone}
          className={styles.vehicleInfo}
          selectedVehicleUser={selectedVehicleUser}
          searchRegNumber={searchRegNumber}
          onChangeSearchRegNumber={regNumber => setSearchRegNumber(regNumber)}
          onSearchRegistrationNumber={handleSearchVehicle}
          onSelectUser={personalId => {
            setSelectedVehicleUser(personalId);
            setSearchPersonalId(personalId);
          }}
          onUpdateField={handleUpdateVehicleField}
        />
        <PersonalInfo
          person={person}
          className={styles.personalInfo}
          searchPersonalId={searchPersonalId}
          onChangeSearchPersonalId={personalId =>
            setSearchPersonalId(personalId)
          }
          onSearchPerson={handleSearchPerson}
          onUpdateField={handleUpdatePersonField}
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
            onClick={() => console.log('save')}>
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
