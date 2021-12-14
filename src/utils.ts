import {
  Address,
  AnyObject,
  Customer,
  ParkingZone,
  PermitDetail,
  PermitInfoDetail,
  SavedStatus,
  Vehicle,
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

export function stripTypenames(obj: AnyObject): AnyObject {
  const newObj: AnyObject = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (key === '__typename') {
      return;
    }
    if (value && !Array.isArray(value) && typeof value === 'object') {
      newObj[key] = stripTypenames(value as AnyObject);
    } else {
      newObj[key] = value;
    }
  });
  return newObj;
}

export function extractPermitInfoDetail(
  permitDetail: PermitDetail
): PermitInfoDetail {
  return {
    contractType: permitDetail.contractType,
    monthCount: permitDetail.monthCount,
    startTime: permitDetail.startTime,
    endTime: permitDetail.endTime,
    status: permitDetail.status,
  };
}
