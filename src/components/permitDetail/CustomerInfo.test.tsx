import { render, screen } from '@testing-library/react';
import useUserRole, { UserRole } from '../../api/useUserRole';
import type { Address, Customer, PermitDetail } from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import CustomerInfo from './CustomerInfo';

vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));

const emptyPermit = getEmptyPermit();

const primaryAddress: Address = {
  ...emptyPermit.address,
  streetName: 'Main Street',
  streetNumber: '10',
  city: 'Helsinki',
  postalCode: '00100',
};

const otherAddress: Address = {
  ...emptyPermit.address,
  streetName: 'Side Street',
  streetNumber: '2',
  city: 'Espoo',
  postalCode: '00200',
};

const customer: Customer = {
  ...emptyPermit.customer,
  firstName: 'Jane',
  lastName: 'Doe',
  nationalIdNumber: '123456-7890',
  email: 'jane@example.com',
  phoneNumber: '0401234567',
  primaryAddress,
  primaryAddressApartment: 'B 2',
  otherAddress,
  otherAddressApartment: 'A 3',
};

const permit: PermitDetail = {
  ...emptyPermit,
  customer,
};

const renderCustomerInfo = (currentPermit = permit) =>
  render(<CustomerInfo permit={currentPermit} />);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useUserRole).mockReturnValue(UserRole.SUPER_ADMIN);
});

describe('CustomerInfo', () => {
  it('renders customer details and formatted addresses', () => {
    renderCustomerInfo();

    expect(screen.getByText('Customer information')).toBeVisible();
    expect(screen.getByText('Personal ID')).toBeInTheDocument();
    expect(screen.getByText('123456-7890')).toBeInTheDocument();
    expect(screen.getByText('Permanent address')).toBeInTheDocument();
    expect(
      screen.getByText('Main Street 10 B 2, Helsinki')
    ).toBeInTheDocument();
    expect(screen.getByText('Temporary address')).toBeInTheDocument();
    expect(screen.getByText('Side Street 2 A 3, Espoo')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('0401234567')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows dashes when address and contact information are missing', () => {
    renderCustomerInfo({
      ...permit,
      customer: {
        ...customer,
        nationalIdNumber: '',
        primaryAddress: undefined,
        otherAddress: undefined,
        phoneNumber: '',
        email: '',
      },
    });

    expect(screen.getAllByText('-')).toHaveLength(5);
  });

  it('hides addresses when the customer has a security ban', () => {
    renderCustomerInfo({
      ...permit,
      customer: { ...customer, addressSecurityBan: true },
    });

    expect(screen.getByText('Personal ID')).toBeInTheDocument();
    expect(screen.getByText('123456-7890')).toBeInTheDocument();
    expect(screen.queryByText('Permanent address')).not.toBeInTheDocument();
    expect(screen.queryByText('Temporary address')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Main Street 10 B 2, Helsinki')
    ).not.toBeInTheDocument();
  });

  it('hides customer fields from inspectors', () => {
    vi.mocked(useUserRole).mockReturnValue(UserRole.INSPECTORS);
    renderCustomerInfo();

    expect(screen.getByText('Customer information')).toBeVisible();
    expect(screen.queryByText('Personal ID')).not.toBeInTheDocument();
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
  });
});
