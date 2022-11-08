import { gql, useApolloClient } from '@apollo/client';
import {
  Button,
  Checkbox,
  Notification,
  PhoneInput,
  RadioButton,
  TextInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, Customer, ParkingZone } from '../../types';
import AddressSearch from '../common/AddressSearch';
import Divider from '../common/Divider';
import ZoneSelect from '../common/ZoneSelect';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.residentPermit.personalInfo';

const ZONE_BY_LOCATION_QUERY = gql`
  query GetZoneByLocation($location: [Float]!) {
    zoneByLocation(location: $location) {
      name
      label
      labelSv
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
  onUpdatePerson: (person: Customer) => void;
}

const PersonalInfo = ({
  className,
  person,
  searchError,
  onSearchPerson,
  onUpdatePerson,
}: PersonalInfoProps): React.ReactElement => {
  const { t } = useTranslation();
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
  const client = useApolloClient();
  const onSelectAddress = (addressField: AddressField, address: Address) => {
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
        onUpdatePerson({
          ...person,
          [addressField]: newAddress,
          zone: zoneByLocation,
        });
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
          onChange={e =>
            onUpdatePerson({ ...person, nationalIdNumber: e.target.value })
          }>
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
          onChange={e =>
            onUpdatePerson({ ...person, addressSecurityBan: e.target.checked })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="firstName"
          disabled={addressSecurityBan}
          label={t(`${T_PATH}.firstName`)}
          value={addressSecurityBan ? '' : firstName}
          onChange={e =>
            onUpdatePerson({ ...person, firstName: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          disabled={addressSecurityBan}
          id="lastName"
          label={t(`${T_PATH}.lastName`)}
          value={addressSecurityBan ? '' : lastName}
          onChange={e =>
            onUpdatePerson({ ...person, lastName: e.target.value })
          }
        />
        <RadioButton
          disabled={addressSecurityBan}
          className={styles.fieldItem}
          id="usePrimaryAddress"
          name="selectedAddress"
          label={t(`${T_PATH}.primaryAddress`)}
          value={addressSecurityBan ? '' : SelectedAddress.PRIMARY}
          checked={selectedAddress === SelectedAddress.PRIMARY}
          onChange={() => {
            setSelectedAddress(SelectedAddress.PRIMARY);
            if (primaryAddress?.zone) {
              onUpdatePerson({ ...person, zone: primaryAddress.zone });
            }
          }}
        />
        <AddressSearch
          disabled={
            addressSecurityBan || selectedAddress !== SelectedAddress.PRIMARY
          }
          className={styles.addressSearch}
          address={addressSecurityBan ? undefined : primaryAddress}
          onSelect={address => onSelectAddress('primaryAddress', address)}
        />
        <RadioButton
          disabled={addressSecurityBan}
          className={styles.fieldItem}
          id="useOtherAddress"
          name="selectedAddress"
          label={addressSecurityBan ? '' : t(`${T_PATH}.otherAddress`)}
          value={addressSecurityBan ? '' : SelectedAddress.OTHER}
          checked={selectedAddress === SelectedAddress.OTHER}
          onChange={() => {
            setSelectedAddress(SelectedAddress.OTHER);
            if (otherAddress?.zone) {
              onUpdatePerson({ ...person, zone: otherAddress.zone });
            }
          }}
        />
        <AddressSearch
          disabled={
            addressSecurityBan || selectedAddress !== SelectedAddress.OTHER
          }
          className={styles.addressSearch}
          address={addressSecurityBan ? undefined : otherAddress}
          onSelect={address => onSelectAddress('otherAddress', address)}
        />
        <ZoneSelect
          required
          className={styles.fieldItem}
          value={zone}
          onChange={(selectedZone: ParkingZone) =>
            onUpdatePerson({ ...person, zone: selectedZone })
          }
          error={addressSearchError}
        />
        <Divider className={styles.fieldDivider} />
        <PhoneInput
          className={styles.fieldItem}
          id="phoneNumber"
          label={t(`${T_PATH}.phoneNumber`)}
          value={phoneNumber}
          onChange={e =>
            onUpdatePerson({ ...person, phoneNumber: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="email"
          label={t(`${T_PATH}.email`)}
          value={email}
          onChange={e => onUpdatePerson({ ...person, email: e.target.value })}
        />
        <Divider className={styles.fieldDivider} />
        <Checkbox
          className={styles.fieldItem}
          id="driverLicenseChecked"
          label={t(`${T_PATH}.driverLicenseChecked`)}
          checked={driverLicenseChecked}
          onChange={e =>
            onUpdatePerson({
              ...person,
              driverLicenseChecked: e.target.checked,
            })
          }
        />
      </div>
    </div>
  );
};
export default PersonalInfo;
