import { SearchInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PermitSearchParams } from '../../types';
import styles from './PermitsSearch.module.scss';
import StatusSelect from './StatusSelect';

const T_PATH = 'components.permits.permitsSearch';
export interface PermitsSearchProps {
  searchParams: PermitSearchParams;
  onSearch: (searchInfo: PermitSearchParams) => void;
}

const PermitsSearch = ({
  searchParams,
  onSearch,
}: PermitsSearchProps): React.ReactElement => {
  const { t } = useTranslation();
  const [localSearchParams, setLocalSearchParams] = useState(searchParams);
  const { status, q } = localSearchParams;
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <StatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={newStatus => setLocalSearchParams({ q, status: newStatus })}
        />
        <SearchInput
          className={styles.SearchInput}
          label=""
          placeholder={q || t(`${T_PATH}.placeholder`)}
          onSubmit={value => onSearch({ ...localSearchParams, q: value })}
        />
      </div>
    </div>
  );
};

export default PermitsSearch;
