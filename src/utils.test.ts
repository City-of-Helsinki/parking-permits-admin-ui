import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ParkingPermitStatus,
  PermitContractType,
  ProductType,
  ProductUnit,
  VehicleClass,
} from './types';
import type {
  Address,
  Customer,
  CustomerActivePermit,
  OrderItem,
  ParkingZone,
  Permit,
  PermitDetail,
  Product,
  Vehicle,
} from './types';
import { getEmptyPermit } from './components/residentPermit/consts';
import {
  convertAddressToAddressInput,
  convertToCustomerInput,
  convertToPermitInput,
  convertToVehicleInput,
  formatAddress,
  formatAddresses,
  formatCustomerName,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDateTimeDisplayWithoutSeconds,
  formatMonthlyPrice,
  formatParkingZone,
  formatPeriod,
  formatPermitAddresses,
  formatPermitMaxValidPeriodInMonths,
  formatPermitOrder,
  formatPrice,
  formatRegistrationNumbers,
  formatVehicleName,
  getApolloErrorMessage,
  getEnvValue,
  getPermitAddresses,
  getPermitTotalPrice,
  getProductPrice,
  getProductsWithQuantities,
  isPermitAddress,
  isPermitEditable,
  isValidForPriceCheck,
  isValidIBAN,
  joinSet,
  mapValues,
} from './utils';

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  getI18n: () => ({ language: 'fi' }),
}));

const address: Address = {
  streetName: 'Mannerheimintie',
  streetNameSv: 'Mannerheimvägen',
  streetNumber: '1',
  city: 'HELSINKI',
  citySv: 'HELSINGFORS',
  postalCode: '00100',
};
const otherAddress: Address = {
  ...address,
  streetName: 'Aleksanterinkatu',
  streetNameSv: 'Alexandersgatan',
  streetNumber: '2',
};
const zone: ParkingZone = {
  name: 'A',
  label: 'Zone A',
  labelSv: 'Zon A',
};
const locatedAddress: Address = {
  ...address,
  location: [0, 0],
  zone,
};
const vehicle: Vehicle = {
  manufacturer: 'Toyota',
  model: 'Corolla',
  registrationNumber: 'ABC123',
  isLowEmission: true,
  consentLowEmissionAccepted: true,
  serialNumber: 'VIN-123',
  vehicleClass: VehicleClass.M1,
  restrictions: ['restriction'],
  powerType: { identifier: '01', name: 'Bensin' },
  updatedFromTraficomOn: '2030-01-01',
};
const customer: Customer = {
  id: 'customer-1',
  sourceId: 'source-1',
  firstName: 'Jane',
  lastName: 'Doe',
  nationalIdNumber: '010190-123A',
  primaryAddress: address,
  primaryAddressApartment: 'A 1',
  otherAddress,
  otherAddressApartment: 'B 2',
  email: 'jane@example.com',
  phoneNumber: '0401234567',
  addressSecurityBan: false,
  driverLicenseChecked: true,
};
const permit: Permit = {
  id: 'permit-1',
  type: ProductType.RESIDENT,
  customer,
  vehicle,
  parkingZone: zone,
  status: ParkingPermitStatus.VALID,
  address,
  startTime: '2030-01-01T00:00:00.000Z',
  primaryVehicle: true,
  canAdminExtendPermit: false,
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
};
const product: Product = {
  id: 'product-1',
  type: ProductType.RESIDENT,
  zone: 'A',
  unitPrice: 10,
  unit: ProductUnit.MONTHLY,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  vat: 2.4,
  vatPercentage: 24,
  lowEmissionDiscount: 0.1,
  lowEmissionDiscountPercentage: 10,
  secondaryVehicleIncreaseRate: 0.25,
  modifiedAt: '2030-01-01T10:00:00.000Z',
  modifiedBy: 'Admin',
};
const orderItem: OrderItem = {
  id: 'order-item-1',
  product,
};
const makePermitDetail = (
  overrides: Partial<PermitDetail> = {}
): PermitDetail => ({
  ...getEmptyPermit(),
  customer,
  vehicle,
  parkingZone: zone,
  address,
  startTime: permit.startTime,
  ...overrides,
});
const makeActivePermit = (
  id: string,
  primaryVehicle: boolean,
  endTime = '2030-06-30T00:00:00.000Z'
): CustomerActivePermit => ({
  id,
  primaryVehicle,
  monthCount: 6,
  startTime: permit.startTime,
  endTime,
  contractType: PermitContractType.FIXED_PERIOD,
});
const getPermitOrder = (overrides: Partial<PermitDetail> = {}) =>
  formatPermitOrder(makePermitDetail(overrides), 'First', 'Second');
const firstPeriodProduct: Product = {
  ...product,
  id: 'product-period-1',
  unitPrice: 10,
  endDate: '2030-01-31',
};
const secondPeriodProduct: Product = {
  ...product,
  id: 'product-period-2',
  unitPrice: 20,
  endDate: '2030-03-31',
};
const pricingStartDate = new Date('2030-01-01T00:00:00.000Z');

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

  it('omits a missing street number', () => {
    const noNumber = { ...address, streetNumber: null } as unknown as Address;
    expect(formatAddress(noNumber, 'fi', { withPostalCode: true })).toBe(
      'Mannerheimintie, 00100 HELSINKI'
    );
    expect(formatAddress(noNumber, 'sv')).toBe('Mannerheimvägen, HELSINGFORS');
  });

  it('returns a dash without an address', () => {
    expect(formatAddress(undefined, 'sv')).toBe('-');
  });
});

describe('error and text helpers', () => {
  it('joins GraphQL errors', () => {
    const error = new ApolloError({
      graphQLErrors: [
        new GraphQLError('First error'),
        new GraphQLError('Second error'),
      ],
    });

    expect(getApolloErrorMessage(error)).toBe('First error, Second error');
  });

  it('reads GraphQL errors from an HTTP network error', () => {
    const networkError = Object.assign(new Error('HTTP error'), {
      result: { errors: [{ message: 'Gateway error' }] },
    });

    expect(getApolloErrorMessage(new ApolloError({ networkError }))).toBe(
      'Gateway error'
    );
  });

  it('falls back to the Apollo error message', () => {
    expect(
      getApolloErrorMessage(new ApolloError({ errorMessage: 'Request failed' }))
    ).toBe('Request failed');
  });

  it('formats a count and unit', () => {
    expect(formatPeriod(3, 'months')).toBe('3 months');
  });

  it('formats customer, vehicle, zone, and price values', () => {
    expect(formatCustomerName(customer)).toBe('Doe, Jane');
    expect(
      formatRegistrationNumbers([permit, { ...permit, id: 'permit-2' }])
    ).toBe('ABC123, ABC123');
    expect(formatParkingZone(orderItem)).toBe('A');
    expect(formatVehicleName(vehicle)).toBe('ABC123 Toyota Corolla');
    const roundingPrice = Number('123.456');
    expect(formatPrice(roundingPrice)).toBe('123.46');
    expect(formatMonthlyPrice(roundingPrice, () => '€/month')).toBe(
      '123.46 €/month'
    );
  });
});

describe('address helpers', () => {
  it('compares permit addresses by street and street-number prefix', () => {
    expect(
      isPermitAddress(
        { ...address, streetNumber: '10 A' },
        { ...address, streetNumber: '10 B' }
      )
    ).toBe(true);
    expect(isPermitAddress(address, otherAddress)).toBe(false);
    expect(isPermitAddress(undefined, address)).toBe(false);
    expect(isPermitAddress(address, undefined)).toBe(false);
  });

  it('collects and formats permit addresses', () => {
    const secondPermit = { ...permit, id: 'permit-2', address: otherAddress };

    expect(getPermitAddresses([permit, secondPermit])).toEqual([
      address,
      otherAddress,
    ]);
    expect(formatAddresses([], 'fi')).toBe('-');
    expect(formatAddresses([address, otherAddress], 'fi')).toBe(
      'Mannerheimintie 1, HELSINKI, Aleksanterinkatu 2, HELSINKI'
    );
    expect(formatPermitAddresses([], 'fi')).toBe('-');
    expect(formatPermitAddresses([permit, secondPermit], 'sv')).toBe(
      'Mannerheimvägen 1, HELSINGFORS, Alexandersgatan 2, HELSINGFORS'
    );
  });
});

describe('date helpers', () => {
  it('formats date-only and date-time values passed as strings or Dates', () => {
    const dateTime = '2030-01-15T10:30:00';
    const date = new Date(dateTime);

    expect(formatDateDisplay(dateTime)).toBe('15.1.2030');
    expect(formatDateDisplay(date)).toBe('15.1.2030');
    expect(formatDateTimeDisplay(dateTime)).toBe('15.1.2030 10:30');
    expect(formatDateTimeDisplay(date)).toBe('15.1.2030 10:30');
  });

  it('formats a localized date-time without seconds', () => {
    const formatted = formatDateTimeDisplayWithoutSeconds(
      '2030-01-15T10:30:45'
    );

    expect(formatted).toContain('2030');
    expect(formatted).not.toMatch(/:\d{2}:\d{2}/);
  });
});

describe('permit helpers', () => {
  it('determines the permit order from its id and active permits', () => {
    expect(getPermitOrder()).toBe('First');
    expect(
      getPermitOrder({
        customer: {
          ...customer,
          activePermits: [makeActivePermit('active-1', false)],
        },
      })
    ).toBe('Second');
    expect(
      getPermitOrder({
        customer: {
          ...customer,
          activePermits: [
            makeActivePermit('active-1', true),
            makeActivePermit('active-2', false),
          ],
        },
      })
    ).toBe('-');
    expect(getPermitOrder({ id: 1 })).toBe('First');
    expect(getPermitOrder({ id: 1, primaryVehicle: false })).toBe('Second');
  });

  it('uses the maximum period unless an existing primary permit limits it', () => {
    const primary = makeActivePermit('primary', true);
    const permitWithPrimary = makePermitDetail({
      customer: { ...customer, activePermits: [primary] },
    });

    expect(formatPermitMaxValidPeriodInMonths(makePermitDetail(), true)).toBe(
      Number('12')
    );
    expect(formatPermitMaxValidPeriodInMonths(makePermitDetail(), false)).toBe(
      Number('12')
    );
    expect(formatPermitMaxValidPeriodInMonths(permitWithPrimary, false)).toBe(
      Number('6')
    );
  });

  it('allows price checks only when all required fields are present', () => {
    const validInput = convertToPermitInput(
      makePermitDetail({ address: locatedAddress })
    );

    expect(isValidForPriceCheck(validInput)).toBe(true);
    expect(isValidForPriceCheck({ ...validInput, zone: '' })).toBe(false);
    expect(isValidForPriceCheck({ ...validInput, startTime: '' })).toBe(false);
    expect(isValidForPriceCheck({ ...validInput, monthCount: 0 })).toBe(false);
    expect(
      isValidForPriceCheck({
        ...validInput,
        vehicle: { ...validInput.vehicle, powerType: null },
      })
    ).toBe(false);
    expect(
      isValidForPriceCheck({
        ...validInput,
        vehicle: { ...validInput.vehicle, registrationNumber: '' },
      })
    ).toBe(false);
  });

  it.each([
    [ParkingPermitStatus.CLOSED, false],
    [ParkingPermitStatus.VALID, true],
    [ParkingPermitStatus.DRAFT, true],
  ])('editability for status %s is %s', (status, editable) => {
    expect(isPermitEditable({ ...permit, status })).toBe(editable);
  });
});

describe('input conversions', () => {
  it('converts vehicle fields and preserves a missing power type', () => {
    expect(convertToVehicleInput(vehicle)).toEqual({
      manufacturer: 'Toyota',
      model: 'Corolla',
      registrationNumber: 'ABC123',
      consentLowEmissionAccepted: true,
      serialNumber: 'VIN-123',
      vehicleClass: VehicleClass.M1,
      powerType: { identifier: '01', name: 'Bensin' },
    });
    expect(
      convertToVehicleInput({ ...vehicle, powerType: null }).powerType
    ).toBeNull();
  });

  it('converts addresses only when location data is present', () => {
    expect(convertAddressToAddressInput(address)).toBeUndefined();
    const convertedAddress = convertAddressToAddressInput(locatedAddress);
    expect(convertedAddress).toMatchObject({
      streetName: locatedAddress.streetName,
      streetNameSv: locatedAddress.streetNameSv,
      streetNumber: locatedAddress.streetNumber,
      city: locatedAddress.city,
      citySv: locatedAddress.citySv,
      postalCode: locatedAddress.postalCode,
      location: locatedAddress.location,
    });
    expect(convertedAddress).not.toHaveProperty('zone');
  });

  it('converts customer addresses and keeps absent addresses undefined', () => {
    const converted = convertToCustomerInput({
      ...customer,
      primaryAddress: locatedAddress,
      otherAddress,
    });
    expect(converted.primaryAddress?.location).toEqual(locatedAddress.location);
    expect(converted.otherAddress).toBeUndefined();
    expect(converted.primaryAddressApartment).toBe('A 1');
    expect(converted.otherAddressApartment).toBe('B 2');

    const withoutAddresses = convertToCustomerInput({
      ...customer,
      primaryAddress: undefined,
      otherAddress: undefined,
    });
    expect(withoutAddresses.primaryAddress).toBeUndefined();
    expect(withoutAddresses.otherAddress).toBeUndefined();
  });

  it('converts permits using the permit zone or address zone as fallback', () => {
    const converted = convertToPermitInput(
      makePermitDetail({ address: locatedAddress })
    );
    expect(converted.zone).toBe('A');
    expect(converted.address?.location).toEqual(locatedAddress.location);
    expect(converted.vehicle.registrationNumber).toBe('ABC123');

    const zoneFromAddress = convertToPermitInput(
      makePermitDetail({
        parkingZone: { ...zone, name: '' },
        address: { ...locatedAddress, zone: { ...zone, name: 'Address zone' } },
      })
    );
    expect(zoneFromAddress.zone).toBe('Address zone');
  });
});

describe('product pricing', () => {
  it('assigns months to products according to their end dates', () => {
    expect(
      getProductsWithQuantities(
        [firstPeriodProduct, secondPeriodProduct],
        pricingStartDate,
        3
      )
    ).toEqual([
      [firstPeriodProduct, 1],
      [secondPeriodProduct, 2],
    ]);
    expect(getProductsWithQuantities([], pricingStartDate, 3)).toEqual([]);
  });

  it.each([
    { isLowEmission: false, isSecondaryVehicle: false, expected: 20 },
    { isLowEmission: true, isSecondaryVehicle: false, expected: 18 },
    { isLowEmission: false, isSecondaryVehicle: true, expected: 25 },
    { isLowEmission: true, isSecondaryVehicle: true, expected: 22.5 },
  ])(
    'applies price modifiers: low emission=$isLowEmission, secondary=$isSecondaryVehicle',
    modifiers => {
      expect(getProductPrice(product, 2, modifiers)).toBe(modifiers.expected);
    }
  );

  it('totals the price across product periods', () => {
    expect(
      getPermitTotalPrice(
        [firstPeriodProduct, secondPeriodProduct],
        pricingStartDate,
        3,
        { isLowEmission: false, isSecondaryVehicle: false }
      )
    ).toBe(50);
  });
});

describe('IBAN, sets, and environment values', () => {
  it('accepts valid Finnish IBANs and rejects blank or non-Finnish values', () => {
    expect(isValidIBAN('FI2112345600000785')).toBe(true);
    expect(isValidIBAN('GB82WEST12345698765432')).toBe(false);
    expect(isValidIBAN('')).toBe(false);
    expect(isValidIBAN('   ')).toBe(false);
  });

  it('joins truthy set values with the requested or default separator', () => {
    expect(joinSet(new Set(['north', '', 'south']), '; ')).toBe('north; south');
    expect(joinSet(new Set(['north', 'south']))).toBe('north,south');
    expect(joinSet(new Set([]))).toBe('');
  });

  it('maps every object value to the given value', () => {
    expect(mapValues({ first: 1, second: 2 }, false)).toEqual({
      first: false,
      second: false,
    });
  });
});

/* eslint-disable no-underscore-dangle */
describe('getEnvValue', () => {
  const key = 'UTILS_TEST_ENV_VALUE';
  const originalRuntimeEnv = window._env_;

  afterEach(() => {
    window._env_ = originalRuntimeEnv;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each([
    { value: 'runtime', expected: 'runtime' },
    { value: Number('42'), expected: '42' },
    { value: false, expected: 'false' },
    { value: BigInt('42'), expected: '42' },
  ])('converts runtime value $value to a string', ({ value, expected }) => {
    window._env_ = { ...window._env_, [key]: value };

    expect(getEnvValue(key)).toBe(expected);
  });

  it('prefers runtime values over process environment values', () => {
    window._env_ = { ...window._env_, [key]: 'runtime value' };
    vi.stubEnv(key, 'process value');

    expect(getEnvValue(key)).toBe('runtime value');
  });

  it('falls back to the process environment', () => {
    window._env_ = { ...window._env_, [key]: undefined };
    vi.stubEnv(key, 'process value');

    expect(getEnvValue(key)).toBe('process value');
  });

  it('logs and returns undefined when no value is configured', () => {
    window._env_ = { ...window._env_, [key]: undefined };
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(getEnvValue(key)).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(`No ${key} specified.`);
  });
});
/* eslint-enable no-underscore-dangle */
