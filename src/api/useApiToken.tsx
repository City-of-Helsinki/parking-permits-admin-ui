import { useContext } from 'react';
import { ApiAccessTokenContext } from '../auth/ApiAccessTokenProvider';
import { ApiAccessTokenActions } from '../auth/hooks';
import { getEnv } from '../utils';

const useApiToken = (): string => {
  const { getTokens } = useContext(
    ApiAccessTokenContext
  ) as ApiAccessTokenActions;
  const tokens = getTokens();
  return tokens ? tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')] : '';
};

export default useApiToken;
