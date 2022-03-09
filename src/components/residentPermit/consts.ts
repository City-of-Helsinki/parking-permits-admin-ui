import { addDays, addMonths, endOfDay } from 'date-fns';
import {
  Customer,
  ParkingPermitStatus,
  ParkingZone,
  PermitContractType,
  PermitDetail,
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

export const initialParkingZone: ParkingZone = {
  name: '',
  label: '',
  labelSv: '',
};

export function getEmptyPermit(): PermitDetail {
  const startTime = new Date();
  const endTime = endOfDay(addDays(addMonths(new Date(startTime), 1), -1));
  return {
    customer: initialPerson,
    vehicle: initialVehicle,
    parkingZone: initialParkingZone,
    status: ParkingPermitStatus.VALID,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    description: '',
    currentPeriodEndTime: '',
    canEndImmediately: false,
    canEndAfterCurrentPeriod: false,
    canBeRefunded: false,
    consentLowEmissionAccepted: false,
    contractType: PermitContractType.FIXED_PERIOD,
    monthCount: 1,
    monthsLeft: 0,
    monthlyPrice: 0,
    changeLogs: [],
  };
}
