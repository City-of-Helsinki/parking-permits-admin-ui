import { ParkingPermitStatus, PermitsSearchInfo } from '../../types';
import { ConnectorType, MatchType, SearchField, SearchItem } from '../types';
import filterItems from './filterItems';

export const DEFAULT_SEARCH_INFO: PermitsSearchInfo = {
  status: ParkingPermitStatus.VALID,
  searchText: '',
  filters: [],
};

export function getSearchItems(searchInfo: PermitsSearchInfo): SearchItem[] {
  const { status, searchText, filters } = searchInfo;
  const searchItems: SearchItem[] = [];

  if (status !== 'ALL') {
    // create search item for status select
    searchItems.push({
      connector: ConnectorType.AND,
      fields: [{ matchType: MatchType.EXACT, fieldName: 'status' }],
      value: status,
    });
  }

  if (searchText && filters.length > 0) {
    // create serach item for filters
    const filterFields: SearchField[] = [];
    filterItems
      .filter(item => filters.includes(item.value))
      .forEach(item => {
        const { matchType, searchFields } = item;
        searchFields.forEach(fieldName =>
          filterFields.push({
            matchType,
            fieldName,
          })
        );
      });

    const filterSearchItem: SearchItem = {
      connector: ConnectorType.OR,
      fields: filterFields,
      value: searchText,
    };
    searchItems.push(filterSearchItem);
  }

  return searchItems;
}
