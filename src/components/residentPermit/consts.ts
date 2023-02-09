import {
  Customer,
  EmissionType,
  ParkingPermitStatus,
  ParkingZone,
  PermitContractType,
  PermitDetail,
  Vehicle,
  VehicleClass,
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
  vehicleClass: VehicleClass.M1,
  euroClass: 1,
  emission: 0,
  emissionType: EmissionType.WLTP,
  powerType: {
    name: 'Bensin',
    identifier: '01',
  },
};

export const initialParkingZone: ParkingZone = {
  name: '',
  label: '',
  labelSv: '',
};

export function getEmptyPermit(): PermitDetail {
  const startTime = new Date();
  return {
    customer: initialPerson,
    vehicle: initialVehicle,
    parkingZone: initialParkingZone,
    status: ParkingPermitStatus.VALID,
    startTime: startTime.toISOString(),
    description: '',
    currentPeriodEndTime: '',
    canEndImmediately: false,
    canEndAfterCurrentPeriod: false,
    canBeRefunded: false,
    consentLowEmissionAccepted: false,
    contractType: PermitContractType.FIXED_PERIOD,
    monthCount: 1,
    monthsLeft: 0,
    changeLogs: [],
  };
}
