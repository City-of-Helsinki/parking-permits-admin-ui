import { render, screen } from '@testing-library/react';
import type { Address, Customer } from '../../../types';
import CustomerCard from './CustomerCard';

const primaryAddress: Address = {
  streetName: 'Main Street',
  streetNumber: '2',
  streetNameSv: 'Huvudgatan',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
};

const otherAddress: Address = {
  streetName: 'Side Street',
  streetNumber: '3',
  streetNameSv: 'Sidogatan',
  city: 'Espoo',
  citySv: 'Esbo',
  postalCode: '00200',
};

const customer: Customer = {
  id: 'customer-1',
  sourceId: 'source-1',
  firstName: 'Jori',
  lastName: 'Lindell',
  nationalIdNumber: '010101-123A',
  email: 'jori@example.com',
  phoneNumber: '0401234567',
  primaryAddress,
  otherAddress,
  addressSecurityBan: false,
  driverLicenseChecked: true,
  language: 'en',
};

describe('CustomerCard', () => {
  it('renders customer details and formatted addresses', () => {
    render(<CustomerCard customer={customer} />);

    const fields = [
      ['Last name', 'Lindell'],
      ['First name', 'Jori'],
      ['Personal ID', '010101-123A'],
      ['Email', 'jori@example.com'],
      ['Phone number', '0401234567'],
      ['Address', 'Main Street 2, 00100 Helsinki'],
      ['Temporary address', 'Side Street 3, 00200 Espoo'],
    ];
    for (const [heading, value] of fields) {
      expect(screen.getByRole('heading', { name: heading })).toBeVisible();
      expect(screen.getByText(value)).toBeInTheDocument();
    }

    expect(screen.getByRole('heading', { name: 'Language' })).toBeVisible();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows dashes for missing addresses and translates the customer language', () => {
    render(
      <CustomerCard
        customer={{
          ...customer,
          primaryAddress: undefined,
          otherAddress: undefined,
          language: 'fi',
        }}
      />
    );

    expect(screen.getAllByText('-')).toHaveLength(2);
    expect(screen.getByText('Finnish')).toBeInTheDocument();
  });
});
