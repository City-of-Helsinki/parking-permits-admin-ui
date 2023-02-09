import { addMonths, format } from 'date-fns';
import { extractIBAN } from 'ibantools';
import {
  Address,
  Customer,
  CustomerInput,
  Permit,
  PermitDetail,
  PermitInput,
  PriceModifiers,
  Product,
  ProductWithQuantity,
  Vehicle,
  VehicleInput,
} from './types';

export function getEnv(key: string): string {
  const variable = process.env[key];
  if (variable === undefined) {
    throw new Error(`No ${key} specified.`);
  }
  return variable;
}

export function getBooleanEnv(key: string): boolean {
  const val = getEnv(key);
  return ['true', '1'].includes(val);
}

export function formatAddress(
  address: Address | undefined,
  lang: string,
  options?: { withPostalCode?: boolean }
): string {
  if (!address) {
    return '-';
  }

  const { streetName, streetNameSv, streetNumber, city, citySv } = address;
  let postalCode = '';
  if (options?.withPostalCode) {
    postalCode = `${address.postalCode} `;
  }
  if (lang === 'sv') {
    return `${streetNameSv} ${streetNumber}, ${postalCode}${citySv}`;
  }
  return `${streetName} ${streetNumber}, ${postalCode}${city}`;
}

export function getPermitAddresses(permits: Permit[]): Address[] {
  const addresses = permits.map(permit => permit.address);
  return addresses.filter(address => address);
}

export function formatAddresses(addresses: Address[], lang: string): string {
  return addresses.length > 0
    ? addresses.map(address => formatAddress(address, lang)).join(', ')
    : '-';
}

export function formatPermitAddresses(permits: Permit[], lang: string): string {
  const addresses = getPermitAddresses(permits);
  return formatAddresses(addresses, lang);
}

export function formatDateDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return dt.toLocaleDateString('fi');
}

export function formatDateTimeDisplay(
  datetime: string | Date,
  dtFormat = 'd.M.Y, HH:mm'
): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return dt ? format(dt, dtFormat) : '';
}

export function formatCustomerName(customer: Customer): string {
  const { firstName, lastName } = customer;
  return `${lastName}, ${firstName}`;
}

export function formatRegistrationNumbers(permits: Permit[]): string {
  return permits.map(permit => permit.vehicle.registrationNumber).join(', ');
}

export function formatParkingZone(permit: Permit): string {
  return permit ? permit?.parkingZone.name : '-';
}

export function formatVehicleName(vehicle: Vehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

export function formatPrice(price: number): string {
  return parseFloat(price.toString()).toFixed(2);
}

export function formatMonthlyPrice(price: number): string {
  return `${formatPrice(price)} €/kk`;
}

export function convertToVehicleInput(vehicle: Vehicle): VehicleInput {
  const {
    manufacturer,
    model,
    registrationNumber,
    consentLowEmissionAccepted,
    serialNumber,
    vehicleClass,
    euroClass,
    emission,
    emissionType,
    powerType,
  } = vehicle;
  return {
    manufacturer,
    model,
    registrationNumber,
    consentLowEmissionAccepted,
    serialNumber,
    vehicleClass,
    euroClass,
    emission,
    emissionType,
    powerType: {
      identifier: powerType.identifier,
      name: powerType.name,
    },
  };
}

export function convertAddressToAddressInput(
  address: Address
): Address | undefined {
  if (!address?.location) {
    return undefined;
  }

  const {
    streetName,
    streetNameSv,
    streetNumber,
    city,
    citySv,
    postalCode,
    location,
  } = address;
  return {
    streetName,
    streetNameSv,
    streetNumber,
    city,
    citySv,
    postalCode,
    location,
  };
}

export function convertToCustomerInput(customer: Customer): CustomerInput {
  const {
    firstName,
    lastName,
    nationalIdNumber,
    primaryAddress,
    otherAddress,
    email,
    phoneNumber,
    addressSecurityBan,
    driverLicenseChecked,
  } = customer;
  const primaryAddressInput = primaryAddress
    ? convertAddressToAddressInput(primaryAddress)
    : undefined;
  const otherAddressInput = otherAddress
    ? convertAddressToAddressInput(otherAddress)
    : undefined;
  return {
    firstName,
    lastName,
    nationalIdNumber,
    primaryAddress: primaryAddressInput,
    otherAddress: otherAddressInput,
    email,
    phoneNumber,
    addressSecurityBan,
    driverLicenseChecked,
  };
}

export function convertToPermitInput(permit: PermitDetail): PermitInput {
  const {
    contractType,
    customer,
    vehicle,
    status,
    startTime,
    monthCount,
    description,
    address,
    parkingZone,
  } = permit;
  const vehicleInput = convertToVehicleInput(vehicle);
  const customerInput = convertToCustomerInput(customer);
  return {
    contractType,
    customer: customerInput,
    vehicle: vehicleInput,
    status,
    startTime,
    monthCount,
    description,
    zone: parkingZone?.name || address?.zone?.name,
    address: convertAddressToAddressInput(address),
  };
}

export function isValidForPriceCheck(permit: PermitInput): boolean {
  const { vehicle } = permit;
  const hasRequiredZoneField = !!permit.zone;
  const hasRequiredPermitFields = !!(permit.startTime && permit.monthCount);
  const hasRequiredVehicleFields = !!(
    vehicle.powerType &&
    vehicle.euroClass &&
    vehicle.emissionType &&
    vehicle.registrationNumber?.length &&
    Number.isInteger(vehicle.emission)
  );
  return (
    hasRequiredZoneField && hasRequiredPermitFields && hasRequiredVehicleFields
  );
}

export function getProductsWithQuantities(
  products: Product[],
  startDate: Date,
  monthCount: number
): ProductWithQuantity[] {
  const periodStartDates = [];
  for (let i = 0; i < monthCount; i += 1) {
    const periodStartDate = addMonths(startDate, i);
    periodStartDates.push(periodStartDate);
  }
  let productIndex = 0;
  let periodStartIndex = 0;
  const productWithQuantieis: ProductWithQuantity[] = products.map(product => [
    product,
    0,
  ]);
  while (
    productIndex < products.length &&
    periodStartIndex < periodStartDates.length
  ) {
    const productEndDate = new Date(products[productIndex].endDate);
    if (periodStartDates[periodStartIndex] <= productEndDate) {
      productWithQuantieis[productIndex][1] += 1;
      periodStartIndex += 1;
    } else {
      productIndex += 1;
    }
  }
  return productWithQuantieis;
}

export function getProductPrice(
  product: Product,
  quantity: number,
  priceModifiers: PriceModifiers
): number {
  const { isLowEmission, isSecondaryVehicle } = priceModifiers;
  let price = product.unitPrice * quantity;
  if (isLowEmission) {
    price *= 1 - product.lowEmissionDiscount;
  }
  if (isSecondaryVehicle) {
    price *= 1 + product.secondaryVehicleIncreaseRate;
  }
  return price;
}

export function getPermitTotalPrice(
  products: Product[],
  startDate: Date,
  monthCount: number,
  priceModifiers: PriceModifiers
): number {
  const productsWithQuantities = getProductsWithQuantities(
    products,
    startDate,
    monthCount
  );
  return productsWithQuantities.reduce(
    (totalPrice, [product, quantity]) =>
      totalPrice + getProductPrice(product, quantity, priceModifiers),
    0
  );
}

export function isValidIBAN(value: string): boolean {
  const iban = extractIBAN(value);
  return iban.valid && iban.countryCode === 'FI';
}

export function joinSet<T>(set: Set<T>, separator?: string): string {
  return Array.from(set)
    .filter(val => val)
    .join(separator);
}

export function mapValues<V>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  val: V
): Record<string | number | symbol, V> {
  return Object.keys(obj).reduce((acc, key) => ({ ...acc, [key]: val }), {});
}
