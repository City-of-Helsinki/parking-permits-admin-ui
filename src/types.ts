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

export type CustomerActivePermit = Pick<
  Permit,
  'id' | 'primaryVehicle' | 'monthCount' | 'startTime'
>;

export enum SelectedAddress {
  PRIMARY = 'primaryAddress',
  OTHER = 'otherAddress',
  NONE = 'none',
}

export enum RefundAccountOption {
  KNOWN = 'known',
  UNKNOWN = 'unknown',
}

export interface Customer {
  id: string;
  sourceId: string;
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: Address;
  primaryAddressApartment?: string;
  otherAddress?: Address;
  otherAddressApartment?: string;
  email: string;
  phoneNumber: string;
  zone?: ParkingZone;
  addressSecurityBan: boolean;
  driverLicenseChecked: boolean;
  activePermits?: CustomerActivePermit[];
  language?: Language;
}

export enum EmissionType {
  NEDC = 'NEDC',
  WLTP = 'WLTP',
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

export interface PowerType {
  name: string;
  identifier: string;
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
  restrictions: Array<string>;
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
  lowEmissionDiscountPercentage: number;
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
  lowEmissionDiscountPercentage: number;
  secondaryVehicleIncreaseRate: number;
  modifiedAt: string;
  modifiedBy: string;
}

export type ProductWithQuantity = [Product, number];

export interface Announcement {
  id: string;
  parkingZones: ParkingZone[];
  subjectFi: string;
  contentFi: string;
  subjectSv: string;
  contentSv: string;
  subjectEn: string;
  contentEn: string;
  createdAt: string;
  createdBy: string;
}

export interface PermitPrice {
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
  currentPeriodEndTime?: string;
  contractType: PermitContractType;
  monthCount: number;
}

export interface OrderItem {
  id: string;
  product: Product;
}

export enum ChangeLogEvent {
  CREATED = 'created',
  CHANGED = 'changed',
}

export interface ContentType {
  model: string;
  appLabel: string;
}

export interface ChangeLogContext {
  changes: Record<string, Array<string>>;
}

export interface ChangeLogRelatedObject extends Refund, Order {
  __typename: string;
}

export interface ChangeLog {
  id: string;
  event: ChangeLogEvent;
  key: string;
  createdAt: string;
  createdBy: string;
  validityPeriod: Array<string>;
  context: ChangeLogContext;
  contentType: ContentType;
  relatedObject: ChangeLogRelatedObject;
}

export interface TemporaryVehicle {
  id: string;
  vehicle: Vehicle;
  startTime: Date | string;
  endTime: Date | string | null;
  isActive: boolean;
}

export interface PermitDetail {
  id?: number;
  address: Address;
  addressApartment: string;
  customer: Customer;
  vehicle: Vehicle;
  activeTemporaryVehicle: TemporaryVehicle;
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
  bypassTraficomValidation: boolean;
  contractType: PermitContractType;
  monthCount: number;
  monthsLeft: number;
  changeLogs: ChangeLog[];
  permitPrices: PermitPrice[];
  disableVehicleFields: boolean;
}

export interface PermitDetailData {
  permitDetail: PermitDetail;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
  primaryAddress?: Address;
  primaryAddressApartment?: string;
  otherAddress?: Address;
  otherAddressApartment?: string;
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
  zone: string | undefined;
  address: Address | undefined;
  addressApartment: string;
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

export interface AddressSearchQueryData {
  addressSearch: Address[];
}

export interface LimitedPermitsQueryData {
  limitedPermits: PagedPermits;
}

export interface PagedProducts {
  objects: Product[];
  pageInfo: PageInfo;
}

export interface PagedAnnouncements {
  objects: Announcement[];
  pageInfo: PageInfo;
}

export interface PagedCustomers {
  objects: Customer[];
  pageInfo: PageInfo;
}

export interface ProductsQueryData {
  products: PagedProducts;
}

export interface AnnouncementsQueryData {
  announcements: PagedAnnouncements;
}

export interface CustomersQueryData {
  customers: PagedCustomers;
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
  totalPaymentPrice: number;
  customer: Customer;
  paidTime: string;
  orderPermits: [Permit];
  orderItemsContent: [OrderItem];
  paymentType: string;
  addressText: string;
  parkingZoneName: string;
  vehicles: [string];
}

export interface PagedOrders {
  objects: Order[];
  pageInfo: PageInfo;
}
export interface OrdersQueryData {
  orders: PagedOrders;
}

export interface OrderSearchParams {
  q: string;
  startDate: string;
  endDate: string;
  parkingZone: string;
  contractTypes: string;
  paymentTypes: string;
  priceDiscounts: string;
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

export enum PriceDiscount {
  LOW_EMISSION = 'LOW_EMISSION',
}

export interface CustomerSearchParams {
  name: string;
  nationalIdNumber: string;
}

export interface AddressSearchParams {
  streetName: string;
  streetNumber: string;
  postalCode: string;
  parkingZone: string;
}
