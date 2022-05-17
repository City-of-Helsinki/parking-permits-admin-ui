import { SearchInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParkingPermitStatusOrAll, PermitsSearchInfo } from '../../types';
import styles from './PermitsSearch.module.scss';
import PermitsSearchFilters from './PermitsSearchFilters';
import StatusSelect from './StatusSelect';

const T_PATH = 'components.permits.permitsSearch';
export interface PermitsSearchProps {
  searchInfo: PermitsSearchInfo;
  onSearch: (searchInfo: PermitsSearchInfo) => void;
}

const PermitsSearch = ({
  searchInfo,
  onSearch,
}: PermitsSearchProps): React.ReactElement => {
  const { t } = useTranslation();
  const { status, searchText, filters } = searchInfo;
  const handleStatusChange = (newStatus: ParkingPermitStatusOrAll) =>
    onSearch({
      status: newStatus,
      searchText,
      filters,
    });
  const handleSearchTextChange = (newSearchText: string) =>
    onSearch({
      status,
      searchText: newSearchText,
      filters,
    });
  const handleFiltersChange = (newFilters: string[]) =>
    onSearch({
      status,
      searchText,
      filters: newFilters,
    });

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <StatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={handleStatusChange}
        />
        <SearchInput
          className={styles.SearchInput}
          label=""
          placeholder={t(`${T_PATH}.placeholder`)}
          onSubmit={handleSearchTextChange}
        />
      </div>
      <div className={styles.row}>
        <PermitsSearchFilters
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>
    </div>
  );
};

export default PermitsSearch;
