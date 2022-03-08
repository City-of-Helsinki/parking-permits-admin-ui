import { addMonths } from 'date-fns';
import {
  Address,
  AddressInput,
  Customer,
  CustomerInput,
  PermitDetail,
  PermitInput,
  PriceModifiers,
  Product,
  ProductWithQuantity,
  SavedStatus,
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

export function formatAddress(address: Address, lang: string): string {
  const { streetName, streetNameSv, streetNumber, postalCode, city, citySv } =
    address;
  if (lang === 'sv') {
    return `${streetNameSv} ${streetNumber}, ${postalCode} ${citySv}`;
  }
  return `${streetName} ${streetNumber}, ${postalCode} ${city}`;
}

export function formatDateDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return dt.toLocaleDateString('fi');
}

export function formatDateTimeDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const dateStr = dt.toLocaleDateString('fi');
  const timeStr = dt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr}, ${timeStr}`;
}

export function formatCustomerName(customer: Customer): string {
  const { firstName, lastName } = customer;
  return `${lastName} ${firstName}`;
}

export function formatVehicleName(vehicle: Vehicle): string {
  const { manufacturer, model, registrationNumber } = vehicle;
  return `${registrationNumber} ${manufacturer} ${model}`;
}

export function formatMonthlyPrice(price: number): string {
  const formattedPrice = parseFloat(price.toFixed(2));
  return `${formattedPrice} €/kk`;
}

export function getSavedStatus<T>(key: SavedStatus): T | null {
  const value = sessionStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

export function saveStatus(item: SavedStatus, value: unknown): void {
  sessionStorage.setItem(item as string, JSON.stringify(value));
}

export function convertToVehicleInput(vehicle: Vehicle): VehicleInput {
  const {
    manufacturer,
    model,
    registrationNumber,
    isLowEmission,
    consentLowEmissionAccepted,
    serialNumber,
    category,
  } = vehicle;
  return {
    manufacturer,
    model,
    registrationNumber,
    isLowEmission,
    consentLowEmissionAccepted,
    serialNumber,
    category,
  };
}

function isAddressInput(
  address: Address | AddressInput
): address is AddressInput {
  return 'sourceSystem' in address && 'sourceId' in address;
}

export function convertToCustomerInput(customer: Customer): CustomerInput {
  const {
    firstName,
    lastName,
    nationalIdNumber,
    primaryAddress,
    email,
    phoneNumber,
    zone,
    addressSecurityBan,
    driverLicenseChecked,
  } = customer;
  const addressInput =
    primaryAddress && isAddressInput(primaryAddress)
      ? primaryAddress
      : undefined;
  return {
    firstName,
    lastName,
    nationalIdNumber,
    primaryAddress: addressInput,
    email,
    phoneNumber,
    zone: zone?.name,
    addressSecurityBan,
    driverLicenseChecked,
  };
}

export function convertToPermitInput(permit: PermitDetail): PermitInput {
  const { contractType, customer, vehicle, status, startTime, monthCount } =
    permit;
  const vehicleInput = convertToVehicleInput(vehicle);
  const customerInput = convertToCustomerInput(customer);
  return {
    contractType,
    customer: customerInput,
    vehicle: vehicleInput,
    status,
    startTime,
    monthCount,
  };
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
