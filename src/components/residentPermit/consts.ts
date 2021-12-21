import {
  Customer,
  EditPermitDetail,
  ParkingPermitStatus,
  PermitContractType,
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

export const initialVehicle: Vehicle = {
  manufacturer: '',
  model: '',
  registrationNumber: '',
  isLowEmission: false,
  consentLowEmissionAccepted: false,
  serialNumber: '',
  category: 'M1',
};

export const initialPermit: EditPermitDetail = {
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
  startTime: new Date().toISOString(),
  status: ParkingPermitStatus.VALID,
  vehicle: initialVehicle,
  customer: initialPerson,
};
