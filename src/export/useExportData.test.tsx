import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useExportData from './useExportData';

const mocks = vi.hoisted(() => ({
  waitForApiToken: vi.fn(),
  language: 'sv',
}));

const fetchMock = vi.fn();
const createObjectURL = vi.fn();
let originalCreateObjectURL: PropertyDescriptor | undefined;

const mockBlobResponse = () => {
  const blob = new Blob(['export data']);
  const responseBlob = vi.fn().mockResolvedValue(blob);
  fetchMock.mockResolvedValue({ blob: responseBlob });
  return { blob, responseBlob };
};

const startExport = async (url: string | URL) => {
  const { result } = renderHook(() => useExportData());
  act(() => result.current(url));

  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('blob:export');
  });
};

vi.mock('../api/waitForApiToken', () => ({
  default: mocks.waitForApiToken,
}));

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ i18n: { language: mocks.language } }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  originalCreateObjectURL = Object.getOwnPropertyDescriptor(
    window.URL,
    'createObjectURL'
  );
  Object.defineProperty(window.URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURL,
  });
  vi.spyOn(window, 'open').mockImplementation(() => null);
  vi.stubGlobal('fetch', fetchMock);
  createObjectURL.mockReturnValue('blob:export');
});

afterEach(() => {
  if (originalCreateObjectURL) {
    Object.defineProperty(
      window.URL,
      'createObjectURL',
      originalCreateObjectURL
    );
  } else {
    Reflect.deleteProperty(window.URL, 'createObjectURL');
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useExportData', () => {
  it('fetches the export with the API token and current language, then opens it', async () => {
    const { blob, responseBlob } = mockBlobResponse();
    mocks.waitForApiToken.mockResolvedValue('access-token');

    const url = new URL('https://example.test/export');
    await startExport(url);

    expect(mocks.waitForApiToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      headers: {
        authorization: 'Bearer access-token',
        'Accept-Language': 'sv',
      },
    });
    expect(responseBlob).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('sends an empty authorization header when no token is available', async () => {
    mockBlobResponse();
    mocks.waitForApiToken.mockResolvedValue('');

    const url = '/exports/refunds';
    await startExport(url);

    expect(fetchMock).toHaveBeenCalledWith(url, {
      headers: {
        authorization: '',
        'Accept-Language': 'sv',
      },
    });
  });
});
