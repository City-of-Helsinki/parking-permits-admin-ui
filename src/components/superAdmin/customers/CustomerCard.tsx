import { Card } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Customer } from '../../../types';
import { formatAddress } from '../../../utils';
import styles from './CustomerCard.module.scss';

const T_PATH = 'components.superAdmin.customers.customerCard';

interface CustomerCardProps {
  customer: Customer;
}

const CardRow = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => <div className={styles.row}>{children}</div>;

const CardField = ({
  heading,
  text,
}: {
  heading: string;
  text: string;
}): React.ReactElement => (
  <div>
    <h3 className="heading-xxs">{heading}</h3>
    {text}
  </div>
);

const CustomerCard = ({ customer }: CustomerCardProps): React.ReactElement => {
  const { t, i18n } = useTranslation('', { keyPrefix: T_PATH });
  const {
    firstName,
    lastName,
    nationalIdNumber,
    email,
    phoneNumber,
    primaryAddress,
    otherAddress,
    language,
  } = customer;

  return (
    <Card>
      <CardRow>
        <CardField heading={t('lastName')} text={lastName} />
        <CardField heading={t('firstName')} text={firstName} />
        <CardField heading={t('nationalIdNumber')} text={nationalIdNumber} />
      </CardRow>
      <CardRow>
        <CardField heading={t('email')} text={email} />
        <CardField heading={t('phoneNumber')} text={phoneNumber} />
      </CardRow>
      <CardRow>
        <CardField
          heading={t('address')}
          text={formatAddress(primaryAddress, i18n.language, {
            withPostalCode: true,
          })}
        />
        <CardField
          heading={t('otherAddress')}
          text={formatAddress(otherAddress, i18n.language, {
            withPostalCode: true,
          })}
        />
      </CardRow>
      <CardRow>
        <CardField
          heading={t('language')}
          text={t(`languages.${language}`) || '-'}
        />
      </CardRow>
    </Card>
  );
};

export default CustomerCard;
