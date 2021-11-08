import { Button, Checkbox, PhoneInput, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Person } from '../../services/types';
import Divider from '../common/Divider';
import ZoneSelect from '../common/ZoneSelect';
import styles from './PersonalInfo.module.scss';

const T_PATH = 'components.createResidentPermit.personalInfo';

interface PersonalInfoProps {
  className?: string;
  person?: Person;
  searchPersonalId: string;
  onChangeSearchPersonalId: (personalId: string) => void;
  onSearchPerson: (nationalIdNumber: string) => void;
  onUpdateField: (field: keyof Person, value: unknown) => void;
}

const PersonalInfo = ({
  className,
  person,
  searchPersonalId,
  onChangeSearchPersonalId,
  onSearchPerson,
  onUpdateField,
}: PersonalInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.personalInfo`)}</div>
      <Divider />
      <div className={styles.content}>
        <TextInput
          className={styles.fieldItem}
          id="personalId"
          label={t(`${T_PATH}.personalId`)}
          value={searchPersonalId}
          onChange={e => onChangeSearchPersonalId(e.target.value)}>
          <Button onClick={() => onSearchPerson(searchPersonalId)}>
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
          required
          className={styles.fieldItem}
          id="firstName"
          label={t(`${T_PATH}.firstName`)}
          value={person?.firstName}
          onChange={e => onUpdateField('firstName', e.target.value)}
        />
        <TextInput
          required
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
          value={person?.address}
          onChange={e => onUpdateField('address', e.target.value)}
        />
        <ZoneSelect
          required
          disabled={!person?.addressSecurityBan}
          className={styles.fieldItem}
          value={person?.zone?.name}
          onChange={zone => onUpdateField('zone', zone)}
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
