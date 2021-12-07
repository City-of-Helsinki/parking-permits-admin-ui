import { Customer, ResidentPermitVehicle } from '../types';

export function searchVechile(
  regNumber: string
): Promise<ResidentPermitVehicle> {
  const vehicle: ResidentPermitVehicle = {
    isLowEmission: false,
    consentLowEmissionAccepted: false,
    registrationNumber: regNumber,
    manufacturer: 'Volkswagen',
    model: 'Golf',
    type: 'Henkilöauto',
    engineType: 'Bensin',
    serialNumber: '10000001',
    productionYear: 2010,
    emission: 60,
    lastInspectionDate: '2021-11-15',
    holder: {
      firstName: 'Phil',
      lastName: 'Duncan',
      nationalIdNumber: '123456-789A',
    },
    owner: {
      firstName: 'Sean',
      lastName: 'Arnold',
      nationalIdNumber: '987654-321B',
    },
  };
  return Promise.resolve(vehicle);
}

export function searchPerson(personalId: string): Promise<Customer> {
  const person: Customer = {
    firstName: 'Phil',
    lastName: 'Duncan',
    primaryAddress: {
      streetName: 'Mannerheimintie',
      streetNameSv: 'Mannerheimintie',
      streetNumber: 2,
      city: 'Helsinki',
      citySv: 'Helsingfors',
      postalCode: '00100',
    },
    zone: 'A',
    addressSecurityBan: false,
    nationalIdNumber: personalId,
    phoneNumber: '04412345678',
    email: 'phil.duncan@example.com',
    driverLicenseChecked: false,
  };
  return Promise.resolve(person);
}
