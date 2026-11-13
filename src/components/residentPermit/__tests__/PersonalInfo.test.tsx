import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Address, Customer, ParkingZone } from '../../../types';
import PersonalInfo from '../PersonalInfo';

vi.mock('../../common/AddressSearch', () => ({
  default: ({ onSelect }: { onSelect: (address: Address) => void }) => (
    <button onClick={() => onSelect(searchedAddress)}>pick searched</button>
  ),
}));

vi.mock('../../common/ZoneSelect', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (zone?: ParkingZone) => void;
  }) => (
    <div>
      <span data-testid="zone-value">{value}</span>
      <button onClick={() => onChange(zoneB)}>pick zone</button>
    </div>
  ),
}));

const T_PATH = 'components.residentPermit.personalInfo';
const zoneA: ParkingZone = { name: 'A', label: 'A', labelSv: 'A' };
const zoneB: ParkingZone = { name: 'B', label: 'B', labelSv: 'B' };
const buildAddress = (id: string, streetName: string, zone?: ParkingZone) => ({
  id,
  streetName,
  streetNameSv: streetName,
  streetNumber: '1',
  city: 'Testcity',
  citySv: 'Testcity',
  postalCode: '00000',
  zone,
});
const primaryAddress = buildAddress('1', 'Primarystreet', zoneA);
const otherAddress = buildAddress('2', 'Otherstreet', zoneB);
const searchedAddress = buildAddress('3', 'Searchedstreet', zoneB);

const person: Customer = {
  id: '1',
  sourceId: 'source',
  firstName: '',
  lastName: '',
  nationalIdNumber: '',
  email: '',
  phoneNumber: '',
  primaryAddress,
  primaryAddressApartment: '',
  otherAddress,
  otherAddressApartment: '',
  addressSecurityBan: false,
  driverLicenseChecked: false,
};

const renderInfo = (
  props: Partial<React.ComponentProps<typeof PersonalInfo>> = {}
) => {
  const onSearchPerson = vi.fn();
  const onUpdatePermit = vi.fn();
  render(
    <PersonalInfo
      person={person}
      permitAddress={primaryAddress}
      parkingZone={zoneA}
      onSearchPerson={onSearchPerson}
      onUpdatePermit={onUpdatePermit}
      {...props}
    />
  );
  return { onSearchPerson, onUpdatePermit, user: userEvent.setup() };
};

const customerPatch = (patch: Partial<Customer>) => ({
  customer: { ...person, ...patch },
});

describe('PersonalInfo', () => {
  it('updates the customer from the text fields and checkboxes', async () => {
    const { onUpdatePermit, user } = renderInfo();
    const cases: [string, Partial<Customer>][] = [
      ['personalId', { nationalIdNumber: 'a' }],
      ['firstName', { firstName: 'a' }],
      ['lastName', { lastName: 'a' }],
      ['phoneNumber', { phoneNumber: 'a' }],
      ['email', { email: 'a' }],
    ];

    for (const [field, patch] of cases) {
      onUpdatePermit.mockClear();
      await user.type(screen.getByLabelText(`${T_PATH}.${field}`), 'a');
      expect(onUpdatePermit).toHaveBeenCalledWith(customerPatch(patch));
    }

    await user.click(screen.getByLabelText(`${T_PATH}.addressSecurityBan`));
    expect(onUpdatePermit).toHaveBeenLastCalledWith(
      customerPatch({ addressSecurityBan: true })
    );

    await user.click(screen.getByLabelText(`${T_PATH}.driverLicenseChecked`));
    expect(onUpdatePermit).toHaveBeenLastCalledWith(
      customerPatch({ driverLicenseChecked: true })
    );
  });

  it('searches the person with the current values', async () => {
    const { onSearchPerson, user } = renderInfo({
      person: {
        ...person,
        nationalIdNumber: 'id',
        email: 'a@example.test',
        phoneNumber: '123',
      },
    });

    await user.click(screen.getByRole('button', { name: `${T_PATH}.search` }));

    expect(onSearchPerson).toHaveBeenCalledWith('id', 'a@example.test', '123');
  });

  it('shows the search error and disables the personal id when customer change is disabled', () => {
    renderInfo({ searchError: 'Not found', disableCustomerChange: true });

    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.getByLabelText(`${T_PATH}.personalId`)).toBeDisabled();
  });

  it('selects the address radio by permit address and shows both addresses', () => {
    renderInfo({ permitAddress: otherAddress });

    expect(screen.getByLabelText(`${T_PATH}.otherAddress`)).toBeChecked();
    expect(screen.getByLabelText(`${T_PATH}.primaryAddress`)).not.toBeChecked();
    expect(screen.getByText(/Primarystreet 1/)).toBeInTheDocument();
    expect(screen.getByText(/Otherstreet 1/)).toBeInTheDocument();
  });

  it('updates the permit address and zone when switching the address', async () => {
    const { onUpdatePermit, user } = renderInfo({
      person: { ...person, otherAddressApartment: 'B 2' },
    });

    await user.click(screen.getByLabelText(`${T_PATH}.otherAddress`));

    expect(onUpdatePermit).toHaveBeenCalledWith({
      address: otherAddress,
      addressApartment: 'B 2',
      parkingZone: zoneB,
      customer: {
        ...person,
        otherAddressApartment: 'B 2',
        otherAddress,
      },
    });
  });

  it('does not update the permit when the address has no zone', async () => {
    const { onUpdatePermit, user } = renderInfo({
      person: { ...person, otherAddress: buildAddress('2', 'Otherstreet') },
    });

    await user.click(screen.getByLabelText(`${T_PATH}.otherAddress`));

    expect(onUpdatePermit).not.toHaveBeenCalled();
  });

  it('stores a searched address into the selected address slot', async () => {
    const { onUpdatePermit, user } = renderInfo();

    await user.click(screen.getByText('pick searched'));

    expect(onUpdatePermit).toHaveBeenCalledWith({
      address: searchedAddress,
      addressApartment: undefined,
      parkingZone: zoneB,
      customer: { ...person, primaryAddress: searchedAddress },
    });
  });

  it('stores the apartment into the selected address slot', async () => {
    const { onUpdatePermit, user } = renderInfo();
    const apartment = screen.getByLabelText(`${T_PATH}.addressApartment`);

    await user.type(apartment, 'a');
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      addressApartment: 'a',
      customer: { ...person, primaryAddressApartment: 'a' },
    });

    await user.click(screen.getByLabelText(`${T_PATH}.otherAddress`));
    onUpdatePermit.mockClear();
    await user.type(apartment, 'b');
    expect(onUpdatePermit).toHaveBeenCalledWith({
      addressApartment: 'b',
      customer: { ...person, otherAddressApartment: 'b' },
    });
  });

  it('updates the parking zone from the zone select', async () => {
    const { onUpdatePermit, user } = renderInfo();

    expect(screen.getByTestId('zone-value')).toHaveTextContent('A');
    await user.click(screen.getByText('pick zone'));

    expect(onUpdatePermit).toHaveBeenCalledWith({ parkingZone: zoneB });
  });

  it('blanks and disables the name and address fields with an address security ban', () => {
    renderInfo({
      person: {
        ...person,
        firstName: 'First',
        lastName: 'Last',
        addressSecurityBan: true,
      },
    });

    for (const field of ['firstName', 'lastName']) {
      const input = screen.getByLabelText(`${T_PATH}.${field}`);
      expect(input).toBeDisabled();
      expect(input).toHaveValue('');
    }
    expect(screen.getByLabelText(`${T_PATH}.primaryAddress`)).toBeDisabled();
    expect(screen.getByLabelText(`${T_PATH}.otherAddress`)).toBeDisabled();
    expect(screen.queryByText(/Primarystreet/)).not.toBeInTheDocument();
  });
});
