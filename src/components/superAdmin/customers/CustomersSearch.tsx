import { Button, IconCross, IconSearch, TextInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerSearchParams } from '../../../types';
import styles from './CustomersSearch.module.scss';

const T_PATH = 'components.superAdmin.customers.customersSearch';

export interface CustomersSearchProps {
  searchParams: CustomerSearchParams;
  onSearch: (newSearchParams: CustomerSearchParams) => void;
}

const CustomersSearch = ({
  searchParams,
  onSearch,
}: CustomersSearchProps): React.ReactElement => {
  const { t } = useTranslation();

  const [nationalIdNumber, setNationalIdNumber] = useState(
    searchParams.nationalIdNumber
  );
  const [name, setName] = useState(searchParams.name);

  const handleSubmit = () => onSearch({ nationalIdNumber, name });

  const canClear = () => nationalIdNumber || name;

  const clear = () => {
    setNationalIdNumber('');
    setName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <TextInput
          id="customersSearchName"
          className={styles.searchInput}
          label={t(`${T_PATH}.name`)}
          onChange={e => setName(e.target.value)}
          value={name}
        />
        <TextInput
          id="customersSearchNin"
          className={styles.searchInput}
          label={t(`${T_PATH}.nationalIdNumber`)}
          onChange={e => setNationalIdNumber(e.target.value)}
          value={nationalIdNumber}
        />
        <Button
          className={styles.searchButton}
          iconLeft={<IconSearch />}
          onClick={handleSubmit}>
          {t(`${T_PATH}.searchButton`)}
        </Button>
      </div>
      {canClear() ? (
        <div className={styles.row}>
          <Button
            className={styles.clearButton}
            variant="supplementary"
            iconLeft={<IconCross />}
            onClick={() => clear()}>
            {t(`${T_PATH}.clearButton`)}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CustomersSearch;
