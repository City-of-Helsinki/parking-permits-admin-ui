import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatExportUrl, formatExportUrlPdf, formatGdprApiUrl } from './utils';

const mocks = vi.hoisted(() => ({
  getEnvValue: vi.fn(),
}));

vi.mock('../utils', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils')>()),
  getEnvValue: mocks.getEnvValue,
}));

const backendUrl = 'https://api.example.test';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getEnvValue.mockReturnValue(backendUrl);
});

describe('formatExportUrl', () => {
  it('encodes object search parameters', () => {
    expect(
      formatExportUrl('permits', { q: 'Jane Doe', status: 'OPEN', page: '2' })
    ).toBe(`${backendUrl}/export/permits?q=Jane+Doe&status=OPEN&page=2`);
  });

  it('serializes URLSearchParams', () => {
    const searchParams = new URLSearchParams('q=Jane+Doe&status=OPEN');

    expect(formatExportUrl('refunds', searchParams)).toBe(
      `${backendUrl}/export/refunds?q=Jane+Doe&status=OPEN`
    );
  });

  it('uses a relative export path when no backend URL is configured', () => {
    mocks.getEnvValue.mockReturnValue(undefined);

    expect(formatExportUrl('orders', { page: '1' })).toBe(
      '/export/orders?page=1'
    );
  });
});

describe('formatGdprApiUrl', () => {
  it('joins path segments under the GDPR API base path', () => {
    const url = formatGdprApiUrl(['customers', 'customer-1']);

    expect(url).toBeInstanceOf(URL);
    expect(url.href).toBe(`${backendUrl}/gdpr-api/v1/customers/customer-1`);
  });
});

describe('formatExportUrlPdf', () => {
  it('encodes the data type and object id', () => {
    expect(formatExportUrlPdf('permit', 'permit 1')).toBe(
      `${backendUrl}/export_pdf?data_type=permit&object_id=permit+1`
    );
  });

  it('uses a relative export path when no backend URL is configured', () => {
    mocks.getEnvValue.mockReturnValue(undefined);

    expect(formatExportUrlPdf('refund', 'refund-1')).toBe(
      '/export_pdf?data_type=refund&object_id=refund-1'
    );
  });
});
