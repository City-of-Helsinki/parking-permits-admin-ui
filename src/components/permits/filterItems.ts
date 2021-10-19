import { FilterItem, MatchType } from '../types';

const T_PATH = 'components.permits.filterItems';
const filterItems: FilterItem[] = [
  {
    labelKey: `${T_PATH}.customer`,
    value: 'customer',
    searchFields: ['customer__first_name', 'customer__last_name'],
    matchType: MatchType.STARTSWITH,
  },
  {
    labelKey: `${T_PATH}.hetuOrBusinessId`,
    value: 'hetuOrBusinessId',
    searchFields: ['customer__national_id_number'],
    matchType: MatchType.EXACT,
  },
  {
    labelKey: `${T_PATH}.registrationNumber`,
    value: 'registrationNumber',
    searchFields: ['vehicle__registration_number'],
    matchType: MatchType.EXACT,
  },
  {
    labelKey: `${T_PATH}.identifier`,
    value: 'identifier',
    searchFields: ['identifier'],
    matchType: MatchType.STARTSWITH,
  },
];

export default filterItems;
