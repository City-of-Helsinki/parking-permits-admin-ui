import { SearchItem } from '../components/types';
import { OrderBy } from '../types';
import { getEnv } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export function formatExportUrl(
  dataType: string,
  orderBy?: OrderBy,
  searchItems?: SearchItem[]
): string {
  const baseUrl = getEnv('REACT_APP_PARKING_PERMITS_EXPORT_URL');
  const queryParams = new URLSearchParams({
    data_type: dataType,
  });
  if (orderBy) {
    queryParams.append('order_by', JSON.stringify(orderBy));
  }
  if (searchItems) {
    queryParams.append('search_items', JSON.stringify(searchItems));
  }
  return `${baseUrl}?${queryParams}`;
}
