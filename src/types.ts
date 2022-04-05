import { OrderDirection, SearchItem } from './components/types';

export type AnyObject = Record<string, unknown>;

export interface Address {
  streetName: string;
  streetNumber: string;
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
  primaryAddress?: Address | AddressInput;
  otherAddress?: Address | AddressInput;
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

export enum ProductUnit {
  MONTHLY = 'MONTHLY',
  PIECES = 'PIECES',
}

export interface ProductInput {
  id?: string;
  type: ProductType;
  zone: string;
  unitPrice: number;
  unit: ProductUnit;
  startDate: string;
  endDate: string;
  vatPercentage: number;
  lowEmissionDiscount: number;
}

export interface Product {
  id: string;
  type: ProductType;
  zone: string;
  unitPrice: number;
  unit: ProductUnit;
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
  label: string;
  labelSv: string;
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
  identifier?: number;
  customer: Customer;
  vehicle: Vehicle;
  parkingZone: ParkingZone;
  status: ParkingPermitStatus;
  startTime: string;
  endTime?: string;
  description: string;
  currentPeriodEndTime: string;
  canEndImmediately: boolean;
  canEndAfterCurrentPeriod: boolean;
  canBeRefunded: boolean;
  consentLowEmissionAccepted: boolean;
  contractType: PermitContractType;
  monthCount: number;
  monthsLeft: number;
  monthlyPrice: number;
  changeLogs: ChangeLog[];
}

export interface PermitDetailData {
  permitDetail: PermitDetail;
}

export interface AddressInput extends Address {
  location: [number, number];
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: AddressInput;
  otherAddress?: AddressInput;
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
  description: string;
}

export interface PageInfo {
  numPages: number;
  page: number;
  prev: number | null;
  next: number | null;
  startIndex: number;
  endIndex: number;
  count: number;
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

export interface CreatePermitResponse {
  createResidentPermit: {
    success: boolean;
    permit: Pick<Permit, 'identifier'>;
  };
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

export interface Refund {
  id: string;
  refundNumber: number;
  name: string;
  amount: number;
  iban: string;
  status: string;
  description: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}
export interface PagedRefunds {
  objects: Refund[];
  pageInfo: PageInfo;
}

export interface RefundsQueryData {
  refunds: PagedRefunds;
}

export interface RefundInput {
  name: string;
  iban: string;
}

export interface PermitPriceChange {
  product: string;
  previousPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangeVat: number;
  startDate: string;
  endDate: string;
  monthCount: number;
}
