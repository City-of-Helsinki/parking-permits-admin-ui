import {
  Customer,
  ParkingPermitStatus,
  PermitContractType,
  PermitInfoDetail,
  Vehicle,
} from '../../types';

export const initialPerson: Customer = {
  firstName: '',
  lastName: '',
  addressSecurityBan: false,
  nationalIdNumber: '',
  phoneNumber: '',
  email: '',
  driverLicenseChecked: false,
};

export const initialPermit: PermitInfoDetail = {
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
  startTime: new Date().toISOString(),
  status: ParkingPermitStatus.VALID,
};

export const initialVehicle: Vehicle = {
  manufacturer: '',
  model: '',
  registrationNumber: '',
  isLowEmission: false,
  consentLowEmissionAccepted: false,
  serialNumber: '',
  category: 'M1',
};
