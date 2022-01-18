import {
  Button,
  Checkbox,
  Notification,
  PhoneInput,
  TextInput,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Customer } from '../../types';
import AddressSearch from '../common/AddressSearch';
import Divider from '../common/Divider';
import ZoneSelect from '../common/ZoneSelect';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.residentPermit.personalInfo';

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
  const { t } = useTranslation();
  const {
    zone,
    primaryAddress,
    nationalIdNumber,
    addressSecurityBan,
    firstName,
    lastName,
    phoneNumber,
    email,
    driverLicenseChecked,
  } = person;
  const defaultZone = zone?.name;
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
        <AddressSearch
          className={styles.fieldItem}
          label={t(`${T_PATH}.address`)}
          address={primaryAddress}
          onSelect={address => onUpdateField('primaryAddress', address)}
        />
        <ZoneSelect
          required
          className={styles.fieldItem}
          label={t(`${T_PATH}.zone`)}
          value={defaultZone}
          onChange={selectedZone => onUpdateField('zone', selectedZone)}
        />
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
