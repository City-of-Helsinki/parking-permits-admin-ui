import { Button, IconSearch, Search } from 'hds-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, PermitSearchParams } from '../../types';
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
  const { t, i18n } = useTranslation();

  const [status, setStatus] = useState(searchParams.status);
  const [query, setQuery] = useState(searchParams.q);

  const texts = useMemo(
    () => ({
      language: i18n.language as Language,
      searchPlaceholder: t(`${T_PATH}.placeholder`),
    }),
    [i18n.language, t]
  );

  const handleSubmit = () => onSearch({ status, q: query });

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <StatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={setStatus}
        />
        <Search
          hideSubmitButton
          id="permitsSearch"
          className={styles.SearchInput}
          texts={texts}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onSend={value => onSearch({ status, q: value })}
        />
        <Button
          className={styles.searchButton}
          iconStart={<IconSearch />}
          onClick={handleSubmit}>
          {t(`${T_PATH}.searchButton`)}
        </Button>
      </div>
    </div>
  );
};

export default PermitsSearch;
