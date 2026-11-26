import { getApiTokensFromStorage } from 'hds-react';
import { getEnvValue } from '../utils';

const RETRY_TIME_MS = 200;
const MAX_RETRY_ATTEMPTS = 10;

const wait = (waitForMs: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), waitForMs);
  });

const getApiToken = () => {
  const tokens = getApiTokensFromStorage();
  return tokens
    ? tokens[getEnvValue('REACT_APP_PARKING_PERMITS_AUDIENCE') || '']
    : undefined;
};

const getApiTokenWithRetry = async (retryAttempt: number): Promise<string> => {
  const apiToken = getApiToken();

  if (apiToken) {
    return apiToken;
  }

  if (retryAttempt === MAX_RETRY_ATTEMPTS) {
    throw new Error('Failed to get API token');
  }

  await wait(RETRY_TIME_MS);
  return getApiTokenWithRetry(retryAttempt + 1);
};

const waitForApiToken = (): Promise<string> => getApiTokenWithRetry(0);

export default waitForApiToken;
