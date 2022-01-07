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

export enum ProductType {
  COMPANY = 'COMPANY',
  RESIDENT = 'RESIDENT',
}

export interface Product {
  id: string;
  type: ProductType;
  zone: string;
  unitPrice: number;
  startDate: string;
  endDate: string;
  vat: number;
  vatPercentage: number;
  lowEmissionDiscount: number;
  secondaryVehicleIncreaseRate: number;
  modifiedAt: string;
  modifiedBy: string;
}

export type ProductWithQuantity = [Product, number];

export interface PriceModifiers {
  isLowEmission: boolean;
  isSecondaryVehicle: boolean;
}

export interface ParkingZone {
  name: string;
  description: string;
  descriptionSv: string;
  residentProducts?: [Product];
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

export type EditPermitDetail = Pick<
  PermitDetail,
  | 'contractType'
  | 'monthCount'
  | 'startTime'
  | 'endTime'
  | 'status'
  | 'vehicle'
  | 'customer'
>;

export interface PermitDetailData {
  permitDetail: PermitDetail;
}

export interface AddressInput {
  streetName: string;
  streetNumber: number;
  streetNameSv: string;
  city: string;
  citySv: string;
  postalCode: string;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: AddressInput;
  zone?: string;
  email: string;
  phoneNumber: string;
  addressSecurityBan: boolean;
  driverLicenseChecked: boolean;
}

export interface VehicleInput {
  manufacturer: string;
  model: string;
  registrationNumber: string;
  isLowEmission: boolean;
  serialNumber: string;
  consentLowEmissionAccepted: boolean;
  category: string;
}

export interface PermitInput {
  contractType: string;
  customer: CustomerInput;
  vehicle: VehicleInput;
  status: string;
  startTime: string;
  monthCount: number;
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

export interface PagedProducts {
  objects: Product[];
  pageInfo: PageInfo;
}

export interface ProductsQueryData {
  products: PagedProducts;
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
