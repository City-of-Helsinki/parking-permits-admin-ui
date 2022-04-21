import { OrderDirection, SearchItem } from './components/types';

export type AnyObject = Record<string, unknown>;

export interface Address {
  streetName: string;
  streetNumber: string;
  streetNameSv: string;
  city: string;
  citySv: string;
  postalCode: string;
  location?: [number, number];
  zone?: ParkingZone;
}

export type CustomerActivePermit = Pick<
  Permit,
  'identifier' | 'primaryVehicle'
>;

export interface Customer {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: Address;
  otherAddress?: Address;
  email: string;
  phoneNumber: string;
  zone?: ParkingZone;
  addressSecurityBan: boolean;
  driverLicenseChecked: boolean;
  activePermits?: CustomerActivePermit[];
}

export enum EmissionType {
  NEDC = 'NEDC',
  WLTP = 'WLTP',
}

export enum PowerType {
  ELECTRIC = 'ELECTRIC',
  BENSIN = 'BENSIN',
  DIESEL = 'DIESEL',
  BIFUEL = 'BIFUEL',
}

export enum VehicleClass {
  M1 = 'M1',
  M2 = 'M2',
  N1 = 'N1',
  N2 = 'N2',
  L3eA1 = 'L3e-A1',
  L3eA2 = 'L3e-A2',
  L3eA3 = 'L3e-A3',
  L3eA1E = 'L3e-A1E',
  L3eA2E = 'L3e-A2E',
  L3eA3E = 'L3e-A3E',
  L3eA1T = 'L3e-A1T',
  L3eA2T = 'L3e-A2T',
  L3eA3T = 'L3e-A3T',
  L4e = 'L4e',
  L5eA = 'L5e-A',
  L5eB = 'L5e-B',
  L6eA = 'L6e-A',
  L6eB = 'L6e-B',
  L6eBP = 'L6e-BP',
  L6eBU = 'L6e-BU',
}

export interface Vehicle {
  manufacturer: string;
  model: string;
  registrationNumber: string;
  isLowEmission: boolean;
  consentLowEmissionAccepted: boolean;
  serialNumber: string;
  vehicleClass: VehicleClass;
  euroClass: number;
  emission: number;
  emissionType: EmissionType;
  powerType: PowerType;
}

export type VehicleInput = Omit<Vehicle, 'isLowEmission'>;

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
  type: string;
  customer: Customer;
  vehicle: Vehicle;
  parkingZone: ParkingZone;
  status: ParkingPermitStatus;
  address: Address;
  startTime: string;
  primaryVehicle: boolean;
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

export interface CustomerInput {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: Address;
  otherAddress?: Address;
  zone?: string;
  email: string;
  phoneNumber: string;
  addressSecurityBan: boolean;
  driverLicenseChecked: boolean;
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

export interface Order {
  id: string;
  orderNumber: number;
  orderType: string;
  totalPrice: number;
  customer: Customer;
  paidTime: string;
  orderPermits: [Permit];
}

export interface PagedOrders {
  objects: Order[];
  pageInfo: PageInfo;
}
export interface OrdersQueryData {
  orders: PagedOrders;
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
