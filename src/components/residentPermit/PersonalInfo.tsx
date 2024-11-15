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
import {
  Address,
  Customer,
  ParkingZone,
  PermitDetail,
  SelectedAddress,
} from '../../types';
import { formatAddress } from '../../utils';
import AddressSearch from '../common/AddressSearch';
import Divider from '../common/Divider';
import ZoneSelect from '../common/ZoneSelect';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.residentPermit.personalInfo';

interface PersonalInfoProps {
  className?: string;
  person: Customer;
  permitAddress: Address;
  parkingZone: ParkingZone;
  searchError?: string;
  disableCustomerChange?: boolean;
  onSearchPerson: (
    nationalIdNumber: string,
    email: string,
    phoneNumber: string
  ) => void;
  onUpdatePermit: (permit: Partial<PermitDetail>) => void;
}

const PersonalInfo = ({
  className,
  person,
  searchError,
  onSearchPerson,
  onUpdatePermit,
  permitAddress,
  parkingZone,
  disableCustomerChange,
}: PersonalInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const {
    primaryAddress,
    primaryAddressApartment,
    otherAddress,
    otherAddressApartment,
    nationalIdNumber,
    addressSecurityBan,
    firstName,
    lastName,
    phoneNumber,
    email,
    driverLicenseChecked,
  } = person;

  const getSelectedAddress = (): SelectedAddress => {
    if (otherAddress && otherAddress?.id === permitAddress?.id) {
      return SelectedAddress.OTHER;
    }

    return SelectedAddress.PRIMARY;
  };

  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress>(
    getSelectedAddress()
  );
  const onSelectAddress = (
    addressField: SelectedAddress,
    address: Address,
    addressApartment: string | undefined = undefined
  ) => {
    if (!address?.zone || addressField === SelectedAddress.NONE) {
      return;
    }
    onUpdatePermit({
      address,
      addressApartment,
      parkingZone: address.zone,
      customer: {
        ...person,
        [addressField]: address,
      },
    });
  };

  const updateCustomer = (customer: Partial<Customer>) => {
    onUpdatePermit({
      customer: {
        ...person,
        ...customer,
      },
    });
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
          disabled={disableCustomerChange}
          onChange={e =>
            updateCustomer({ ...person, nationalIdNumber: e.target.value })
          }>
          <Button
            onClick={() =>
              onSearchPerson(nationalIdNumber, email, phoneNumber)
            }>
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
            updateCustomer({ ...person, addressSecurityBan: e.target.checked })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="firstName"
          disabled={addressSecurityBan}
          label={t(`${T_PATH}.firstName`)}
          value={addressSecurityBan ? '' : firstName}
          onChange={e =>
            updateCustomer({ ...person, firstName: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          disabled={addressSecurityBan}
          id="lastName"
          label={t(`${T_PATH}.lastName`)}
          value={addressSecurityBan ? '' : lastName}
          onChange={e =>
            updateCustomer({ ...person, lastName: e.target.value })
          }
        />
        <div className={styles.radioGroup}>
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
              onSelectAddress(
                SelectedAddress.PRIMARY,
                primaryAddress as Address,
                primaryAddressApartment
              );
            }}
          />
          <div className={styles.radioGroupAddress}>
            {primaryAddress && !addressSecurityBan
              ? formatAddress(primaryAddress, i18n.language)
              : ''}
          </div>
        </div>
        <div className={styles.radioGroup}>
          <RadioButton
            disabled={addressSecurityBan}
            className={styles.fieldItem}
            id="useOtherAddress"
            name="selectedAddress"
            label={t(`${T_PATH}.otherAddress`)}
            value={addressSecurityBan ? '' : SelectedAddress.OTHER}
            checked={selectedAddress === SelectedAddress.OTHER}
            onChange={() => {
              setSelectedAddress(SelectedAddress.OTHER);
              onSelectAddress(
                SelectedAddress.OTHER,
                otherAddress as Address,
                otherAddressApartment
              );
            }}
          />
          <div className={styles.radioGroupAddress}>
            {otherAddress && !addressSecurityBan
              ? formatAddress(otherAddress, i18n.language)
              : ''}
          </div>
        </div>
        <AddressSearch
          className={styles.addressSearch}
          onSelect={address => onSelectAddress(selectedAddress, address)}
        />
        <TextInput
          className={styles.fieldItem}
          id="addressApartment"
          label={t(`${T_PATH}.addressApartment`)}
          value={
            selectedAddress === SelectedAddress.PRIMARY
              ? primaryAddressApartment
              : otherAddressApartment
          }
          onChange={e => {
            if (selectedAddress === SelectedAddress.PRIMARY) {
              onUpdatePermit({
                addressApartment: e.target.value,
                customer: {
                  ...person,
                  primaryAddressApartment: e.target.value,
                },
              });
            } else {
              onUpdatePermit({
                addressApartment: e.target.value,
                customer: {
                  ...person,
                  otherAddressApartment: e.target.value,
                },
              });
            }
          }}
        />
        <ZoneSelect
          required
          className={styles.fieldItem}
          value={parkingZone?.name}
          onChange={(selectedZone: ParkingZone) =>
            onUpdatePermit({ parkingZone: selectedZone })
          }
        />
        <Divider className={styles.fieldDivider} />
        <PhoneInput
          className={styles.fieldItem}
          id="phoneNumber"
          label={t(`${T_PATH}.phoneNumber`)}
          value={phoneNumber}
          onChange={e =>
            updateCustomer({ ...person, phoneNumber: e.target.value })
          }
        />
        <TextInput
          className={styles.fieldItem}
          id="email"
          label={t(`${T_PATH}.email`)}
          value={email}
          onChange={e => updateCustomer({ ...person, email: e.target.value })}
        />
        <Divider className={styles.fieldDivider} />
        <Checkbox
          className={styles.fieldItem}
          id="driverLicenseChecked"
          label={t(`${T_PATH}.driverLicenseChecked`)}
          checked={driverLicenseChecked}
          onChange={e =>
            updateCustomer({
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
