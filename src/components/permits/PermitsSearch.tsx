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
  const { status, searchText, filter } = searchInfo;
  const handleStatusChange = (newStatus: ParkingPermitStatusOrAll) =>
    onSearch({
      status: newStatus,
      searchText,
      filter,
    });
  const handleSearchTextChange = (newSearchText: string) =>
    onSearch({
      status,
      searchText: newSearchText,
      filter,
    });
  const handleFilterChange = (newFilter: string) =>
    onSearch({
      status,
      searchText,
      filter: newFilter,
    });

  return (
    <div className={styles['search-container']}>
      <StatusSelect
        className={styles['status-select']}
        value={status}
        onChange={handleStatusChange}
      />
      <SearchInput
        className={styles['search-input']}
        label={t(`${T_PATH}.search`)}
        onSubmit={handleSearchTextChange}
      />
      <PermitsSearchFilters filter={filter} onChange={handleFilterChange} />
    </div>
  );
};

export default PermitsSearch;
