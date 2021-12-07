import { Button, Checkbox, PhoneInput, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Customer, ParkingZone } from '../../types';
import { formatAddress } from '../../utils';
import Divider from '../common/Divider';
import ZoneSelect from '../common/ZoneSelect';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.createResidentPermit.personalInfo';

interface PersonalInfoProps {
  className?: string;
  person: Customer;
  onSearchPerson: (nationalIdNumber: string) => void;
  onUpdateField: (field: keyof Customer, value: unknown) => void;
  onSelectZone: (zone: ParkingZone | undefined) => void;
}

const PersonalInfo = ({
  className,
  person,
  onSearchPerson,
  onUpdateField,
  onSelectZone,
}: PersonalInfoProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const defaultZone = person.zone || person.primaryAddress?.zone?.name;
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.personalInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          className={styles.fieldItem}
          id="personalId"
          label={t(`${T_PATH}.personalId`)}
          value={person.nationalIdNumber}
          onChange={e => onUpdateField('nationalIdNumber', e.target.value)}>
          <Button onClick={() => onSearchPerson(person.nationalIdNumber)}>
            {t(`${T_PATH}.search`)}
          </Button>
        </TextInput>
        <Checkbox
          className={styles.fieldItem}
          id="addressSecurityBan"
          label={t(`${T_PATH}.addressSecurityBan`)}
          checked={person?.addressSecurityBan}
          onChange={e => onUpdateField('addressSecurityBan', e.target.checked)}
        />
        <TextInput
          className={styles.fieldItem}
          id="firstName"
          label={t(`${T_PATH}.firstName`)}
          value={person?.firstName}
          onChange={e => onUpdateField('firstName', e.target.value)}
        />
        <TextInput
          className={styles.fieldItem}
          id="lastName"
          label={t(`${T_PATH}.lastName`)}
          value={person?.lastName}
          onChange={e => onUpdateField('lastName', e.target.value)}
        />
        <TextInput
          readOnly
          className={styles.fieldItem}
          id="address"
          label={t(`${T_PATH}.address`)}
          value={
            person.primaryAddress
              ? formatAddress(person.primaryAddress, i18n.language)
              : '-'
          }
        />
        <ZoneSelect
          required
          className={styles.fieldItem}
          value={defaultZone}
          onChange={zone => {
            onUpdateField('zone', zone?.name || '');
            onSelectZone(zone);
          }}
        />
        <Divider className={styles.fieldDivider} />
        <PhoneInput
          className={styles.fieldItem}
          id="phoneNumber"
          label={t(`${T_PATH}.phoneNumber`)}
          value={person?.phoneNumber}
          onChange={e => onUpdateField('phoneNumber', e.target.value)}
        />
        <TextInput
          className={styles.fieldItem}
          id="email"
          label={t(`${T_PATH}.email`)}
          value={person?.email}
          onChange={e => onUpdateField('email', e.target.value)}
        />
        <Divider className={styles.fieldDivider} />
        <Checkbox
          className={styles.fieldItem}
          id="driverLicenseChecked"
          label={t(`${T_PATH}.driverLicenseChecked`)}
          checked={person?.driverLicenseChecked}
          onChange={e =>
            onUpdateField('driverLicenseChecked', e.target.checked)
          }
        />
      </div>
    </div>
  );
};
export default PersonalInfo;
