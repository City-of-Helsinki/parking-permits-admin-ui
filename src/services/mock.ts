import { Person, TrafiComVehicle } from './types';

export function searchVechile(regNumber: string): Promise<TrafiComVehicle> {
  const vehicle: TrafiComVehicle = {
    isLowEmission: false,
    consentLowEmissionDiscount: false,
    registrationNumber: regNumber,
    manufacturer: 'Volkswagen',
    model: 'Golf',
    type: 'Personal car',
    serialNumber: '10000001',
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

export function searchPerson(personalId: string): Promise<Person> {
  const person = {
    firstName: 'Phil',
    lastName: 'Duncan',
    address: 'RandomKatu 1, 00100, Helsinki',
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
