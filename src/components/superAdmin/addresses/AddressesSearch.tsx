import { Button, IconCross, IconSearch, TextInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddressSearchParams } from '../../../types';
import ZoneSelect from '../../common/ZoneSelect';
import styles from './AddressesSearch.module.scss';

const T_PATH = 'components.superAdmin.addresses.addressesSearch';

export interface AddressesSearchProps {
  searchParams: AddressSearchParams;
  onSearch: (newSearchParams: AddressSearchParams) => void;
}

const AddressesSearch = ({
  searchParams,
  onSearch,
}: AddressesSearchProps): React.ReactElement => {
  const { t } = useTranslation('', { keyPrefix: T_PATH });

  const [streetName, setStreetName] = useState(searchParams.streetName);
  const [streetNumber, setStreetNumber] = useState(searchParams.streetNumber);
  const [postalCode, setPostalCode] = useState(searchParams.postalCode);
  const [parkingZone, setParkingZone] = useState(searchParams.parkingZone);

  const handleSubmit = () =>
    onSearch({ streetName, streetNumber, postalCode, parkingZone });

  const canClear = () =>
    streetName || streetNumber || postalCode || parkingZone;

  const clear = () => {
    setStreetName('');
    setStreetNumber('');
    setPostalCode('');
    setParkingZone('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <TextInput
          id="addressesSearchStreetName"
          className={styles.searchInput}
          label={t('streetName')}
          onChange={e => setStreetName(e.target.value)}
          value={streetName}
        />
        <TextInput
          id="addressesSearchStreetNumber"
          className={styles.streetNumber}
          label={t('streetNumber')}
          onChange={e => setStreetNumber(e.target.value)}
          value={streetNumber}
        />
        <TextInput
          id="addressesSearchPostalCode"
          className={styles.postalCode}
          label={t('postalCode')}
          onChange={e => setPostalCode(e.target.value)}
          value={postalCode}
        />
        <ZoneSelect
          clearable
          className={styles.parkingZone}
          value={parkingZone}
          onChange={selectedZone => setParkingZone(selectedZone?.name || '')}
        />
        <Button
          className={styles.searchButton}
          iconLeft={<IconSearch />}
          onClick={handleSubmit}>
          {t('searchButton')}
        </Button>
      </div>
      {canClear() ? (
        <div className={styles.row}>
          <Button
            className={styles.clearButton}
            variant="supplementary"
            iconLeft={<IconCross />}
            onClick={() => clear()}>
            {t('clearButton')}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default AddressesSearch;
