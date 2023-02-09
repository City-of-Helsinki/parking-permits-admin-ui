import { Button, IconSearch, SearchInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitSearchParams } from '../../types';
import styles from './PermitsSearch.module.scss';
import StatusSelect from './StatusSelect';

const T_PATH = 'components.permits.permitsSearch';
export interface PermitsSearchProps {
  searchParams: PermitSearchParams;
  onSearch: (newSearchParams: PermitSearchParams) => void;
}

const PermitsSearch = ({
  searchParams,
  onSearch,
}: PermitsSearchProps): React.ReactElement => {
  const { t } = useTranslation();

  const [status, setStatus] = useState(searchParams.status);
  const [query, setQuery] = useState(searchParams.q);

  const handleSubmit = () => onSearch({ status, q: query });

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <StatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={setStatus}
        />
        <SearchInput
          className={styles.SearchInput}
          label=""
          placeholder={searchParams.q || t(`${T_PATH}.placeholder`)}
          onSubmit={handleSubmit}
          onChange={setQuery}
          hideSearchButton
        />
        <Button
          className={styles.searchButton}
          iconLeft={<IconSearch />}
          onClick={handleSubmit}>
          {t(`${T_PATH}.searchButton`)}
        </Button>
      </div>
    </div>
  );
};

export default PermitsSearch;
