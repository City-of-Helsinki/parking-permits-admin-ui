import { OrderDirection, SearchItem } from './components/types';

export type AnyObject = Record<string, unknown>;

export interface Address {
  streetName: string;
  streetNumber: number;
  streetNameSv: string;
  city: string;
  citySv: string;
  postalCode: string;
  zone?: ParkingZone;
}

export interface Customer {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: Address;
  email: string;
  phoneNumber: string;
  zone?: ParkingZone;
  addressSecurityBan: boolean;
  driverLicenseChecked: boolean;
}

export interface Vehicle {
  manufacturer: string;
  model: string;
  registrationNumber: string;
  isLowEmission: boolean;
  consentLowEmissionAccepted: boolean;
  serialNumber: string;
  category: string;
}

export interface ParkingZone {
  name: string;
  description: string;
  descriptionSv: string;
  residentPrice: number;
}

export enum ParkingPermitStatus {
  DRAFT = 'DRAFT',
  VALID = 'VALID',
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export enum PermitContractType {
  OPEN_ENDED = 'OPEN_ENDED',
  FIXED_PERIOD = 'FIXED_PERIOD',
}

export type ParkingPermitStatusOrAll = ParkingPermitStatus | 'ALL';

export enum PermitType {
  RESIDENT = 'resident',
  COMPANY = 'company',
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

export enum ChangeLogEvent {
  CREATED = 'created',
  CHANGED = 'changed',
}

export interface ChangeLog {
  id: number;
  event: ChangeLogEvent;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface PermitDetail {
  identifier: number;
  customer: Customer;
  vehicle: Vehicle;
  parkingZone: ParkingZone;
  status: ParkingPermitStatus;
  startTime: string;
  endTime?: string;
  currentPeriodEndTime: string;
  canEndImmediately: boolean;
  canEndAfterCurrentPeriod: boolean;
  hasRefund: boolean;
  consentLowEmissionAccepted: boolean;
  contractType: PermitContractType;
  monthCount: number;
  monthsLeft: number;
  monthlyPrice: number;
  changeLogs: ChangeLog[];
}

export type PermitInfoDetail = Pick<
  PermitDetail,
  'contractType' | 'monthCount' | 'startTime' | 'endTime' | 'status'
>;

export interface PermitDetailData {
  permitDetail: PermitDetail;
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

export interface VehicleUser {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
}

export interface MutationResponse {
  success: boolean;
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

export type Language = 'fi' | 'sv' | 'en';

export enum PermitEndType {
  IMMEDIATELY = 'IMMEDIATELY',
  AFTER_CURRENT_PERIOD = 'AFTER_CURRENT_PERIOD',
}
