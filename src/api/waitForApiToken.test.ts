import { getApiTokensFromStorage } from 'hds-react';
import waitForApiToken from './waitForApiToken';

const mocks = vi.hoisted(() => ({
  getApiTokensFromStorage: vi.fn(),
  getEnvValue: vi.fn(),
}));

const PARKING_API_AUDIENCE = 'parking-api';
const EXPECTED_TOKEN_LOOKUPS = 11;
const TOKEN = 'test-token';

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  getApiTokensFromStorage: mocks.getApiTokensFromStorage,
}));

vi.mock('../utils', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils')>()),
  getEnvValue: mocks.getEnvValue,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getEnvValue.mockReturnValue(PARKING_API_AUDIENCE);
  mocks.getApiTokensFromStorage.mockReturnValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('waitForApiToken', () => {
  it('returns a token as soon as one is available', async () => {
    mocks.getApiTokensFromStorage.mockReturnValue({
      [PARKING_API_AUDIENCE]: TOKEN,
    });

    await expect(waitForApiToken()).resolves.toBe(TOKEN);
    expect(getApiTokensFromStorage).toHaveBeenCalledTimes(1);
  });

  it('waits for a token between sequential lookup attempts', async () => {
    vi.useFakeTimers();
    mocks.getApiTokensFromStorage
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({ [PARKING_API_AUDIENCE]: TOKEN });

    const tokenPromise = waitForApiToken();
    await vi.runAllTimersAsync();

    await expect(tokenPromise).resolves.toBe(TOKEN);
    expect(getApiTokensFromStorage).toHaveBeenCalledTimes(2);
  });

  it('throws after the retry limit when no token becomes available', async () => {
    vi.useFakeTimers();
    const tokenPromise = waitForApiToken();
    const rejection = expect(tokenPromise).rejects.toThrow(
      'Failed to get API token'
    );

    await vi.runAllTimersAsync();
    await rejection;

    expect(getApiTokensFromStorage).toHaveBeenCalledTimes(
      EXPECTED_TOKEN_LOOKUPS
    );
  });
});
