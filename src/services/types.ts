import { ParkingZone } from '../types';

export interface TrafiComUser {
  firstName: string;
  lastName: string;
  nationalIdNumber: string;
}

export interface TrafiComVehicle {
  isLowEmission: boolean;
  consentLowEmissionDiscount: boolean;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  type: string;
  serialNumber: string;
  holder: TrafiComUser;
  owner: TrafiComUser;
  otherHolder?: TrafiComUser;
}

export interface Person {
  firstName: string;
  lastName: string;
  address: string;
  addressSecurityBan: boolean;
  nationalIdNumber: string;
  zone?: ParkingZone;
  phoneNumber: string;
  email: string;
  driverLicenseChecked: boolean;
}
