import { getApiTokensFromStorage } from 'hds-react';
import { getEnv } from '../utils';

const useApiToken = (): string => {
  const tokens = getApiTokensFromStorage();
  return tokens ? tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')] : '';
};

export default useApiToken;
