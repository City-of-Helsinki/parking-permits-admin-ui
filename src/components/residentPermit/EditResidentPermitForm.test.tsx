import { ApolloError, useLazyQuery } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DocumentNode } from 'graphql';
import type {
  Address,
  Customer,
  ParkingZone,
  PermitDetail,
  Vehicle,
} from '../../types';
import { getEmptyPermit } from './consts';
import EditResidentPermitForm from './EditResidentPermitForm';

const mocks = vi.hoisted(() => ({
  getCustomer: vi.fn(),
  getVehicle: vi.fn(),
}));

type QueryCallbacks = {
  onCompleted?: (data: unknown) => void;
  onError?: (error: ApolloError) => void;
};

const queryCallbacks = new Map<string, QueryCallbacks>();
const emptyPermit = getEmptyPermit();
const zoneA: ParkingZone = { name: 'A', label: 'Zone A', labelSv: 'Zon A' };
const zoneB: ParkingZone = { name: 'B', label: 'Zone B', labelSv: 'Zon B' };

const buildAddress = (
  id: string,
  streetName: string,
  zone: ParkingZone
): Address => ({
  ...emptyPermit.address,
  id,
  streetName,
  streetNumber: '10',
  zone,
});

const primaryAddress = buildAddress('primary-address', 'Main Street', zoneA);
const otherAddress = buildAddress('other-address', 'Side Street', zoneB);

const permit: PermitDetail = {
  ...emptyPermit,
  customer: {
    ...emptyPermit.customer,
    id: 'customer-1',
    firstName: 'Existing',
    nationalIdNumber: '111111-1111',
    email: 'existing@example.com',
    phoneNumber: '0400000000',
    primaryAddress,
    primaryAddressApartment: '1A',
    otherAddress,
    otherAddressApartment: '2B',
  },
  address: otherAddress,
  addressApartment: '2B',
  parkingZone: zoneA,
};

const returnedCustomer: Customer = {
  ...permit.customer,
  firstName: 'Found',
  email: 'server@example.com',
  phoneNumber: '0500000000',
};

const getOperationName = (query: DocumentNode) => {
  const operation = query.definitions[0];
  if (operation?.kind !== 'OperationDefinition' || !operation.name) {
    throw new Error('Expected a named GraphQL operation');
  }
  return operation.name.value;
};

const completeQuery = (name: string, data: unknown) => {
  const onCompleted = queryCallbacks.get(name)?.onCompleted;
  if (!onCompleted) {
    throw new Error(`No onCompleted callback registered for ${name}`);
  }
  act(() => onCompleted(data));
};

const failQuery = (name: string, errorMessage: string) => {
  const onError = queryCallbacks.get(name)?.onError;
  if (!onError) {
    throw new Error(`No onError callback registered for ${name}`);
  }
  act(() => onError(new ApolloError({ errorMessage })));
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: vi.fn(),
}));

vi.mock('./PersonalInfo', () => ({
  default: ({
    person,
    searchError,
    onSearchPerson,
    onUpdatePermit,
  }: {
    person: Customer;
    searchError?: string;
    onSearchPerson: (
      nationalIdNumber: string,
      email: string,
      phoneNumber: string
    ) => void;
    onUpdatePermit: (permit: Partial<PermitDetail>) => void;
  }) => (
    <section data-testid="personal-info">
      <div data-testid="person-search-error">{searchError}</div>
      <button
        onClick={() =>
          onSearchPerson('123456-7890', 'updated@example.com', '0401234567')
        }>
        Search person
      </button>
      <button
        onClick={() =>
          onUpdatePermit({
            customer: { ...person, firstName: 'Updated' },
          })
        }>
        Update personal info
      </button>
    </section>
  ),
}));

vi.mock('./VehicleInfo', () => ({
  default: ({
    vehicle,
    searchError,
    disableVehicleFields,
    onSearchRegistrationNumber,
    onUpdateVehicle,
    onClearVehicle,
  }: {
    vehicle: Vehicle;
    searchError?: string;
    disableVehicleFields: boolean;
    onSearchRegistrationNumber: (regNumber: string) => void;
    onUpdateVehicle: (vehicle: Vehicle) => void;
    onClearVehicle: () => void;
  }) => (
    <section data-testid="vehicle-info">
      <div data-testid="vehicle-search-error">{searchError}</div>
      <div data-testid="vehicle-fields-disabled">
        {String(disableVehicleFields)}
      </div>
      <button onClick={() => onSearchRegistrationNumber('ABC123')}>
        Search vehicle
      </button>
      <button
        onClick={() =>
          onUpdateVehicle({ ...vehicle, manufacturer: 'Updated manufacturer' })
        }>
        Update vehicle
      </button>
      <button onClick={onClearVehicle}>Clear vehicle</button>
    </section>
  ),
}));

vi.mock('./PermitInfo', () => ({
  default: ({
    permit: currentPermit,
    onUpdatePermit,
  }: {
    permit: PermitDetail;
    onUpdatePermit: (permit: PermitDetail) => void;
  }) => (
    <section data-testid="permit-info">
      <button
        onClick={() =>
          onUpdatePermit({
            ...currentPermit,
            description: 'Updated description',
          })
        }>
        Update permit info
      </button>
    </section>
  ),
}));

const renderForm = (initialPermit = permit) => {
  const callbacks = {
    onResetPermit: vi.fn(),
    onResetVehicle: vi.fn(),
    onClearVehicle: vi.fn(),
    onUpdatePermit: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <EditResidentPermitForm
      permit={initialPermit}
      permitPrices={[]}
      {...callbacks}
    />
  );

  return { ...callbacks, user };
};

beforeEach(() => {
  vi.resetAllMocks();
  queryCallbacks.clear();

  vi.mocked(useLazyQuery).mockImplementation((query, options) => {
    const operationName = getOperationName(query);
    queryCallbacks.set(operationName, {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });

    if (operationName === 'GetCustomer') {
      return [mocks.getCustomer] as unknown as ReturnType<typeof useLazyQuery>;
    }
    if (operationName === 'GetVehicle') {
      return [mocks.getVehicle] as unknown as ReturnType<typeof useLazyQuery>;
    }
    throw new Error(`Unexpected lazy query: ${operationName}`);
  });
});

describe('EditResidentPermitForm', () => {
  it('renders the permit sections and cancels without confirming', async () => {
    const { onCancel, onConfirm, user } = renderForm();

    expect(screen.getByText('Resident parking permit')).toBeInTheDocument();
    expect(screen.getByTestId('personal-info')).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-info')).toBeInTheDocument();
    expect(screen.getByTestId('permit-info')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Cancel and close without saving' })
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('merges updates from each section into the permit', async () => {
    const { onUpdatePermit, user } = renderForm();

    await user.click(
      screen.getByRole('button', { name: 'Update personal info' })
    );
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      customer: { ...permit.customer, firstName: 'Updated' },
    });

    await user.click(screen.getByRole('button', { name: 'Update vehicle' }));
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      vehicle: { ...permit.vehicle, manufacturer: 'Updated manufacturer' },
    });

    await user.click(
      screen.getByRole('button', { name: 'Update permit info' })
    );
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      description: 'Updated description',
    });
  });

  it('updates the address and confirms the edit', async () => {
    const { onConfirm, onUpdatePermit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onUpdatePermit).toHaveBeenNthCalledWith(1, {
      ...permit,
      address: otherAddress,
    });
    expect(onUpdatePermit).toHaveBeenLastCalledWith({
      ...permit,
      address: otherAddress,
      addressApartment: '2B',
      parkingZone: zoneB,
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('searches for a customer and keeps the selected address and entered contacts', async () => {
    const { onResetPermit, onUpdatePermit, user } = renderForm();
    mocks.getCustomer.mockResolvedValue({
      data: { customer: returnedCustomer },
    });

    await user.click(screen.getByRole('button', { name: 'Search person' }));

    expect(onResetPermit).toHaveBeenCalledWith('123456-7890');
    expect(mocks.getCustomer).toHaveBeenCalledWith({
      variables: { query: { nationalIdNumber: '123456-7890' } },
    });
    await waitFor(() =>
      expect(onUpdatePermit).toHaveBeenCalledWith({
        ...permit,
        customer: {
          ...returnedCustomer,
          email: 'updated@example.com',
          phoneNumber: '0401234567',
        },
        address: otherAddress,
        addressApartment: '2B',
        parkingZone: zoneB,
      })
    );
  });

  it('does not search for a vehicle without a customer personal ID', async () => {
    const permitWithoutPersonalId: PermitDetail = {
      ...permit,
      customer: { ...permit.customer, nationalIdNumber: '' },
    };
    const { onResetVehicle, user } = renderForm(permitWithoutPersonalId);

    await user.click(screen.getByRole('button', { name: 'Search vehicle' }));

    expect(onResetVehicle).not.toHaveBeenCalled();
    expect(mocks.getVehicle).not.toHaveBeenCalled();
  });

  it('searches for a vehicle and disables its fields after a match', async () => {
    const { onResetVehicle, onUpdatePermit, user } = renderForm();
    const foundVehicle: Vehicle = {
      ...permit.vehicle,
      manufacturer: 'Found Motors',
      registrationNumber: 'ABC123',
    };

    await user.click(screen.getByRole('button', { name: 'Search vehicle' }));

    expect(onResetVehicle).toHaveBeenCalledWith('ABC123');
    expect(mocks.getVehicle).toHaveBeenCalledWith({
      variables: {
        regNumber: 'ABC123',
        nationalIdNumber: permit.customer.nationalIdNumber,
      },
    });
    completeQuery('GetVehicle', { vehicle: foundVehicle });

    expect(onUpdatePermit).toHaveBeenCalledWith({
      ...permit,
      vehicle: foundVehicle,
      disableVehicleFields: true,
    });
  });

  it('shows query errors and clears the vehicle error when the vehicle is cleared', async () => {
    const { onClearVehicle, onUpdatePermit, user } = renderForm();

    failQuery('GetCustomer', 'Customer lookup failed');
    failQuery('GetVehicle', 'Vehicle lookup failed');

    expect(screen.getByTestId('person-search-error')).toHaveTextContent(
      'Customer lookup failed'
    );
    expect(screen.getByTestId('vehicle-search-error')).toHaveTextContent(
      'Vehicle lookup failed'
    );

    await user.click(screen.getByRole('button', { name: 'Clear vehicle' }));

    expect(onClearVehicle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('vehicle-search-error')).toBeEmptyDOMElement();
    expect(screen.getByTestId('person-search-error')).toHaveTextContent(
      'Customer lookup failed'
    );

    completeQuery('GetCustomer', { customer: returnedCustomer });
    expect(screen.getByTestId('person-search-error')).toBeEmptyDOMElement();
    expect(onUpdatePermit).toHaveBeenCalledWith({
      ...permit,
      customer: returnedCustomer,
    });
  });
});
