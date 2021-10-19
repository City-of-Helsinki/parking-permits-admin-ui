import React, { useState } from 'react';
import { ParkingPermitStatus } from '../../types';
import { MatchType, SearchItem } from '../types';
import styles from './PermitsSearch.module.scss';
import PermitsSearchInput from './PermitsSearchInput';
import StatusSelect from './StatusSelect';

export interface PermitsSearchProps {
  onSearch: (searchItems: SearchItem[]) => void;
}

const PermitsSearch = ({
  onSearch,
}: PermitsSearchProps): React.ReactElement => {
  const [searchItem, setSearchItem] = useState<SearchItem>();
  const [status, setStatus] = useState<ParkingPermitStatus | undefined>(
    ParkingPermitStatus.VALID
  );
  const doSearch = (
    _status: ParkingPermitStatus | undefined,
    _searchItem: SearchItem | undefined
  ) => {
    const searchItems: SearchItem[] = [];
    if (_status) {
      searchItems.push({
        matchType: MatchType.EXACT,
        fields: ['status'],
        value: _status,
      });
    }
    if (_searchItem) {
      searchItems.push(_searchItem);
    }
    onSearch(searchItems);
  };
  const handleStatusChange = (newStatus: ParkingPermitStatus | undefined) => {
    setStatus(newStatus);
    doSearch(newStatus, searchItem);
  };
  const handleSearchInputChange = (newSearchItem: SearchItem | undefined) => {
    setSearchItem(newSearchItem);
    doSearch(status, newSearchItem);
  };
  return (
    <div className={styles['search-container']}>
      <StatusSelect
        className={styles['status-select']}
        value={status}
        onChange={handleStatusChange}
      />
      <PermitsSearchInput onChange={handleSearchInputChange} />
    </div>
  );
};

export default PermitsSearch;
