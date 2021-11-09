import { Address, Customer, ParkingZone, SavedStatus, Vehicle } from './types';

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
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const date = dt.getDate();
  return `${date}.${month}.${year}`;
}

export function formatDateTimeDisplay(datetime: string | Date): string {
  const dt = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const year = dt.getFullYear();
  const month = dt.getMonth();
  const date = dt.getDate();
  const hours = dt.getHours();
  const minutes = dt.getMinutes();
  return `${date}.${month}.${year}, ${hours}:${minutes}`;
}

export function formatZone(zone: ParkingZone, lang: string): string {
  const { name, description, descriptionSv } = zone;
  return `${name} - ${lang === 'sv' ? descriptionSv : description}`;
}

export function formatCustomerName(customer: Customer): string {
  const { firstName, lastName } = customer;
  return `${firstName} ${lastName}`;
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
