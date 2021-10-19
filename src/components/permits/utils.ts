import { ParkingPermitStatus, PermitsSearchInfo } from '../../types';
import { MatchType, SearchItem } from '../types';
import filterItems from './filterItems';

export const DEFAULT_SEARCH_INFO: PermitsSearchInfo = {
  status: ParkingPermitStatus.VALID,
  searchText: '',
  filter: 'customer',
};

export function getSearchItems(searchInfo: PermitsSearchInfo): SearchItem[] {
  const { status, searchText, filter } = searchInfo;
  const searchItems: SearchItem[] = [];
  if (status !== 'ALL') {
    searchItems.push({
      matchType: MatchType.EXACT,
      fields: ['status'],
      value: status,
    });
  }

  const filterItem = filterItems.find(item => item.value === filter);
  if (searchText && filterItem) {
    const { matchType, searchFields } = filterItem;
    searchItems.push({
      matchType,
      fields: searchFields,
      value: searchText,
    });
  }
  return searchItems;
}
