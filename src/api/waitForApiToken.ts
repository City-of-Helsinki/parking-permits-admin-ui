import { getApiTokensFromStorage } from 'hds-react';
import { getEnv } from '../utils';

const RETRY_TIME_MS = 200;
const MAX_RETRY_ATTEMPTS = 10;

const wait = (waitForMs: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), waitForMs);
  });

const getApiToken = () => {
  const tokens = getApiTokensFromStorage();
  return tokens
    ? tokens[getEnv('REACT_APP_PARKING_PERMITS_AUDIENCE')]
    : undefined;
};

const waitForApiToken = async (): Promise<string> => {
  const retryAttempts = 0;
  while (retryAttempts <= MAX_RETRY_ATTEMPTS) {
    const apiToken = getApiToken();
    if (apiToken) {
      return apiToken;
    }
    // eslint-disable-next-line no-await-in-loop
    await wait(RETRY_TIME_MS);
  }
  throw new Error('Failed to get API token');
};

export default waitForApiToken;
