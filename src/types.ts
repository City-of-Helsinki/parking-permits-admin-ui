import { OrderDirection } from './components/types';

export type AnyObject = Record<string, unknown>;

export interface Address {
  id?: string;
  streetName: string;
  streetNumber: string;
  streetNameSv: string;
  city: string;
  citySv: string;
  postalCode: string;
  location?: [number, number];
  zone?: ParkingZone;
}

export type CustomerActivePermit = Pick<Permit, 'id' | 'primaryVehicle'>;

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

export interface PermitPrice {
  originalUnitPrice: number;
  unitPrice: number;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface PriceModifiers {
  isLowEmission: boolean;
  isSecondaryVehicle: boolean;
}

export interface ParkingZone {
  name: string;
  label: string;
  labelSv: string;
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
  id: string;
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
  id: string;
  event: ChangeLogEvent;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface PermitDetail {
  id?: number;
  customer: Customer;
  vehicle: Vehicle;
  primaryVehicle: boolean;
  parkingZone: ParkingZone;
  status: ParkingPermitStatus;
  startTime: string;
  endTime?: string;
  description: string;
  totalRefundAmount: number;
  currentPeriodEndTime: string;
  canEndImmediately: boolean;
  canEndAfterCurrentPeriod: boolean;
  canBeRefunded: boolean;
  consentLowEmissionAccepted: boolean;
  contractType: PermitContractType;
  monthCount: number;
  monthsLeft: number;
  changeLogs: ChangeLog[];
  permitPrices: PermitPrice[];
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

export interface PagedAddresses {
  objects: Address[];
  pageInfo: PageInfo;
}

export interface AddressesQueryData {
  addresses: PagedAddresses;
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
    permit: Pick<Permit, 'id'>;
  };
}

export interface OrderBy {
  orderField: string;
  orderDirection: OrderDirection;
}

export interface PageInput {
  page: number;
  pageSize?: number;
}
export interface PermitsQueryVariables {
  pageInput: PageInput;
  orderBy?: OrderBy;
  searchParams?: PermitSearchParams;
}

export interface SearchBaseParams {
  page?: number;
  pageSize?: number;
  orderBy?: string[];
  orderDirection?: OrderDirection;
}

export interface PermitSearchParams {
  status: ParkingPermitStatusOrAll;
  q: string;
}

export type Language = 'fi' | 'sv' | 'en';

export enum PermitEndType {
  IMMEDIATELY = 'IMMEDIATELY',
  AFTER_CURRENT_PERIOD = 'AFTER_CURRENT_PERIOD',
}

export interface Order {
  id: string;
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

export enum RefundStatus {
  OPEN = 'OPEN',
  REQUEST_FOR_APPROVAL = 'REQUEST_FOR_APPROVAL',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export type RefundStatusOrAll = RefundStatus | 'ALL';

export interface Refund {
  id: string;
  name: string;
  amount: number;
  iban: string;
  status: RefundStatus;
  description: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
  acceptedAt: string;
  acceptedBy: string;
  order: Order;
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

export enum PaymentType {
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
  CASHIER_PAYMENT = 'CASHIER_PAYMENT',
}

export interface RefundSearchParams {
  q: string;
  startDate: string;
  endDate: string;
  status: RefundStatusOrAll;
  paymentTypes: string;
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

export interface LowEmissionCriterion {
  id?: string;
  powerType: PowerType;
  nedcMaxEmissionLimit: number;
  wltpMaxEmissionLimit: number;
  euroMinClassLimit: number;
  startDate: string;
  endDate: string;
}

export interface PagedLowEmissionCriteria {
  objects: LowEmissionCriterion[];
  pageInfo: PageInfo;
}

export interface LowEmissionCriteriaQueryData {
  lowEmissionCriteria: PagedLowEmissionCriteria;
}
