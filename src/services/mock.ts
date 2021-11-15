import { ResidentPermitCustomer, ResidentPermitVehicle } from '../types';

export function searchVechile(
  regNumber: string
): Promise<ResidentPermitVehicle> {
  const vehicle: ResidentPermitVehicle = {
    isLowEmission: false,
    consentLowEmissionAccepted: false,
    registrationNumber: regNumber,
    manufacturer: 'Volkswagen',
    model: 'Golf',
    type: 'Personal car',
    serialNumber: '10000001',
    productionYear: 2010,
    emission: 60,
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

export function searchPerson(
  personalId: string
): Promise<ResidentPermitCustomer> {
  const person: ResidentPermitCustomer = {
    firstName: 'Phil',
    lastName: 'Duncan',
    address: {
      streetName: 'RandomKatu',
      streetNameSv: 'RandomKatu',
      streetNumber: 1,
      city: 'Helsinki',
      citySv: 'Helsingfors',
      postalCode: '00100',
    },
    zone: {
      name: 'A',
      description: 'Kamppi',
      descriptionSv: 'Kampen',
      price: 30,
    },
    addressSecurityBan: false,
    nationalIdNumber: personalId,
    phoneNumber: '04412345678',
    email: 'phil.duncan@example.com',
    driverLicenseChecked: false,
  };
  return Promise.resolve(person);
}
