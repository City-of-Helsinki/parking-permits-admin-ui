import { OrderDirection, SearchItem } from './components/types';

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
  DRAFT = 'DRAFT',
  VALID = 'VALID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export type ParkingPermitStatusOrAll = ParkingPermitStatus | 'ALL';

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

export interface OrderBy {
  field: string;
  orderFields: string[];
  orderDirection: OrderDirection;
}

export interface PageInput {
  page: number;
  pageSize?: number;
}
export interface PermitsQueryVariables {
  pageInput: PageInput;
  orderBy?: OrderBy;
  searchItems?: SearchItem[];
}

export interface PermitsSearchInfo {
  status: ParkingPermitStatusOrAll;
  searchText: string;
  filter: string;
}

export enum SavedStatus {
  PERMITS_PAGE = 'permitsPage',
  PERMITS_ORDER_BY = 'permitsOrderBy',
  PERMITS_SEARCH_INFO = 'permitsSearchInfo',
}
