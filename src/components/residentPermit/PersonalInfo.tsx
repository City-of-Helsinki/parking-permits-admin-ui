import { gql, useApolloClient, useQuery } from '@apollo/client';
import {
  Button,
  Checkbox,
  Notification,
  PhoneInput,
  RadioButton,
  Select,
  TextInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddressInput, Customer, ParkingZone } from '../../types';
import AddressSearch from '../common/AddressSearch';
import Divider from '../common/Divider';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.residentPermit.personalInfo';

const ZONES_QUERY = gql`
  query Query {
    zones {
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
`;

const ZONE_BY_LOCATION_QUERY = gql`
  query GetZoneByLocation($location: [Float]!) {
    zoneByLocation(location: $location) {
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
`;

enum SelectedAddress {
  PRIMARY = 'primary',
  OTHER = 'other',
}

type AddressField = 'primaryAddress' | 'otherAddress';

interface PersonalInfoProps {
  className?: string;
  person: Customer;
  searchError?: string;
  onSearchPerson: (nationalIdNumber: string) => void;
  onUpdateField: (field: keyof Customer, value: unknown) => void;
}

const PersonalInfo = ({
  className,
  person,
  searchError,
  onSearchPerson,
  onUpdateField,
}: PersonalInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const {
    zone,
    primaryAddress,
    otherAddress,
    nationalIdNumber,
    addressSecurityBan,
    firstName,
    lastName,
    phoneNumber,
    email,
    driverLicenseChecked,
  } = person;
  const [addressSearchError, setAddressSearchError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress>(
    SelectedAddress.PRIMARY
  );
  const { data } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);
  const client = useApolloClient();
  const onSelectAddress = (
    addressField: AddressField,
    address: AddressInput
  ) => {
    client
      .query<{ zoneByLocation: ParkingZone }>({
        query: ZONE_BY_LOCATION_QUERY,
        variables: {
          location: address.location,
        },
      })
      .then(response => {
        const { zoneByLocation } = response.data;
        const newAddress = {
          ...address,
          zone: zoneByLocation,
        };
        onUpdateField(addressField, newAddress);
        onUpdateField('zone', zoneByLocation);
      })
      .catch(error => setAddressSearchError(error.message));
  };
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.personalInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          className={styles.fieldItem}
          id="personalId"
          label={t(`${T_PATH}.personalId`)}
          value={nationalIdNumber}
          onChange={e => onUpdateField('nationalIdNumber', e.target.value)}>
          <Button onClick={() => onSearchPerson(nationalIdNumber)}>
            {t(`${T_PATH}.search`)}
          </Button>
        </TextInput>
        {searchError && <Notification type="error">{searchError}</Notification>}
        <Checkbox
          className={styles.fieldItem}
          id="addressSecurityBan"
          label={t(`${T_PATH}.addressSecurityBan`)}
          checked={addressSecurityBan}
          onChange={e => onUpdateField('addressSecurityBan', e.target.checked)}
        />
        <TextInput
          className={styles.fieldItem}
          id="firstName"
          disabled={addressSecurityBan}
          label={t(`${T_PATH}.firstName`)}
          value={firstName}
          onChange={e => onUpdateField('firstName', e.target.value)}
        />
        <TextInput
          className={styles.fieldItem}
          disabled={addressSecurityBan}
          id="lastName"
          label={t(`${T_PATH}.lastName`)}
          value={lastName}
          onChange={e => onUpdateField('lastName', e.target.value)}
        />
        <RadioButton
          disabled={addressSecurityBan}
          className={styles.fieldItem}
          id="usePrimaryAddress"
          name="selectedAddress"
          label={t(`${T_PATH}.primaryAddress`)}
          value={SelectedAddress.PRIMARY}
          checked={selectedAddress === SelectedAddress.PRIMARY}
          onChange={() => {
            setSelectedAddress(SelectedAddress.PRIMARY);
            if (primaryAddress?.zone) {
              onUpdateField('zone', primaryAddress.zone);
            }
          }}
        />
        <AddressSearch
          disabled={
            addressSecurityBan || selectedAddress !== SelectedAddress.PRIMARY
          }
          className={styles.addressSearch}
          address={primaryAddress}
          onSelect={address => onSelectAddress('primaryAddress', address)}
        />
        <RadioButton
          disabled={addressSecurityBan}
          className={styles.fieldItem}
          id="useOtherAddress"
          name="selectedAddress"
          label={t(`${T_PATH}.otherAddress`)}
          value={SelectedAddress.OTHER}
          checked={selectedAddress === SelectedAddress.OTHER}
          onChange={() => {
            setSelectedAddress(SelectedAddress.OTHER);
            if (otherAddress?.zone) {
              onUpdateField('zone', otherAddress.zone);
            }
          }}
        />
        <AddressSearch
          disabled={
            addressSecurityBan || selectedAddress !== SelectedAddress.OTHER
          }
          className={styles.addressSearch}
          address={otherAddress}
          onSelect={address => onSelectAddress('otherAddress', address)}
        />
        {data?.zones && (
          <Select
            required
            className={styles.fieldItem}
            label={t(`${T_PATH}.zone`)}
            options={data.zones}
            optionLabelField={i18n.language === 'sv' ? 'labelSv' : 'label'}
            value={zone || null}
            onChange={(selectedZone: ParkingZone) =>
              onUpdateField('zone', selectedZone)
            }
            error={addressSearchError}
          />
        )}
        <Divider className={styles.fieldDivider} />
        <PhoneInput
          className={styles.fieldItem}
          id="phoneNumber"
          label={t(`${T_PATH}.phoneNumber`)}
          value={phoneNumber}
          onChange={e => onUpdateField('phoneNumber', e.target.value)}
        />
        <TextInput
          className={styles.fieldItem}
          id="email"
          label={t(`${T_PATH}.email`)}
          value={email}
          onChange={e => onUpdateField('email', e.target.value)}
        />
        <Divider className={styles.fieldDivider} />
        <Checkbox
          className={styles.fieldItem}
          id="driverLicenseChecked"
          label={t(`${T_PATH}.driverLicenseChecked`)}
          checked={driverLicenseChecked}
          onChange={e =>
            onUpdateField('driverLicenseChecked', e.target.checked)
          }
        />
      </div>
    </div>
  );
};
export default PersonalInfo;
