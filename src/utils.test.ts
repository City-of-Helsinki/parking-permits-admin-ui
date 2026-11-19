import { describe, it, expect } from 'vitest';
import { Address } from './types';
import { formatAddress } from './utils';

const address = {
  streetName: 'Mannerheimintie',
  streetNameSv: 'Mannerheimvägen',
  streetNumber: '1',
  city: 'HELSINKI',
  citySv: 'HELSINGFORS',
  postalCode: '00100',
} as Address;

describe('formatAddress', () => {
  it('formats a Finnish address', () => {
    expect(formatAddress(address, 'fi', { withPostalCode: true })).toBe(
      'Mannerheimintie 1, 00100 HELSINKI'
    );
  });

  it('formats a Swedish address', () => {
    expect(
      formatAddress(address, 'sv', {
        withPostalCode: true,
        addressApartment: 'A 6',
      })
    ).toBe('Mannerheimvägen 1 A 6, 00100 HELSINGFORS');
  });

  it.each([undefined, null, ''])(
    'falls back to Finnish names when the Swedish ones are %j',
    missing => {
      const noSwedish = {
        ...address,
        streetNameSv: missing,
        citySv: missing,
      } as unknown as Address;
      expect(formatAddress(noSwedish, 'sv')).toBe(
        'Mannerheimintie 1, HELSINKI'
      );
    }
  );

  it('returns a dash without an address', () => {
    expect(formatAddress(undefined, 'sv')).toBe('-');
  });
});
