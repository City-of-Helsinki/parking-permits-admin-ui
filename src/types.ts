export interface Address {
  streetName: string;
  streetNumber: number;
  streetNameSv: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress: Address;
}

export interface Vehicle {
  manufacturer: string;
  model: string;
  registrationNumber: string;
}

export interface ParkingZone {
  name: string;
}

export enum ParkingPermitStatus {
  DRAFT,
  VALID,
  CANCELLED,
  EXPIRED,
}
export interface Permit {
  identifier: number;
  customer: Customer;
  vehicle: Vehicle;
  parkingZone: ParkingZone;
  status: ParkingPermitStatus;
  startTime: string;
  endTime?: string;
}

export interface PageInfo {
  numPages: number;
  page: number;
  prev: number | null;
  next: number | null;
}

export interface PagedPermits {
  objects: Permit[];
  pageInfo: PageInfo;
}

export interface PermitsQueryData {
  permits: PagedPermits;
}
