import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleClass } from '../../types';
import type { PowerType, Vehicle } from '../../types';
import { getEmptyPermit } from './consts';
import VehicleInfo from './VehicleInfo';

const vehicle: Vehicle = {
  ...getEmptyPermit().vehicle,
  manufacturer: 'Test Motors',
  model: 'Model X',
  registrationNumber: 'abc123',
  serialNumber: 'serial-1',
  restrictions: [],
};

vi.mock('../common/VehicleClassSelect', () => ({
  default: ({
    value,
    disabled,
    onChange,
  }: {
    value: VehicleClass;
    disabled?: boolean;
    onChange: (value: VehicleClass) => void;
  }) => (
    <div>
      <span data-testid="vehicle-class">{value}</span>
      <span data-testid="vehicle-class-disabled">{String(disabled)}</span>
      <button onClick={() => onChange(VehicleClass.N1)}>
        Select vehicle class
      </button>
    </div>
  ),
}));

vi.mock('../common/PowerTypeSelect', () => ({
  default: ({
    powerType,
    disabled,
    onChange,
  }: {
    powerType: PowerType;
    disabled?: boolean;
    onChange: (powerType: PowerType) => void;
  }) => (
    <div>
      <span data-testid="power-type">{powerType.name}</span>
      <span data-testid="power-type-disabled">{String(disabled)}</span>
      <button onClick={() => onChange({ name: 'Diesel', identifier: '02' })}>
        Select power type
      </button>
    </div>
  ),
}));

const renderVehicleInfo = (
  overrides: {
    vehicle?: Vehicle;
    disableVehicleFields?: boolean;
    searchError?: string;
  } = {}
) => {
  const callbacks = {
    onSearchRegistrationNumber: vi.fn(),
    onUpdateVehicle: vi.fn(),
    onClearVehicle: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <VehicleInfo
      vehicle={vehicle}
      disableVehicleFields={false}
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('VehicleInfo', () => {
  it('displays the registration number, searches it, and clears the vehicle', async () => {
    const { onClearVehicle, onSearchRegistrationNumber, user } =
      renderVehicleInfo();

    expect(screen.getByLabelText('Registration number')).toHaveValue('ABC123');

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearchRegistrationNumber).toHaveBeenCalledWith('abc123');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClearVehicle).toHaveBeenCalledTimes(1);
  });

  it('does not search when the registration number is empty', async () => {
    const { onSearchRegistrationNumber, user } = renderVehicleInfo({
      vehicle: { ...vehicle, registrationNumber: '' },
    });

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearchRegistrationNumber).not.toHaveBeenCalled();
  });

  it('updates vehicle fields, selectors, and low-emission consent', async () => {
    const { onUpdateVehicle, user } = renderVehicleInfo();
    const fieldChanges = [
      ['Registration number', 'XYZ789', 'registrationNumber'],
      ['Manufacturer', 'New Motors', 'manufacturer'],
      ['Model', 'Model Y', 'model'],
      ['Serial number', 'serial-2', 'serialNumber'],
    ] as const;

    for (const [label, value, field] of fieldChanges) {
      onUpdateVehicle.mockClear();
      fireEvent.change(screen.getByLabelText(label), {
        target: { value },
      });
      expect(onUpdateVehicle).toHaveBeenCalledWith({
        ...vehicle,
        [field]: value,
      });
    }

    await user.click(
      screen.getByRole('button', { name: 'Select vehicle class' })
    );
    expect(onUpdateVehicle).toHaveBeenLastCalledWith({
      ...vehicle,
      vehicleClass: VehicleClass.N1,
    });

    await user.click(screen.getByRole('button', { name: 'Select power type' }));
    expect(onUpdateVehicle).toHaveBeenLastCalledWith({
      ...vehicle,
      powerType: { name: 'Diesel', identifier: '02' },
    });

    await user.click(
      screen.getByLabelText(
        'Permission for a 50% discount on other off-road parking when paying with parking applications'
      )
    );
    expect(onUpdateVehicle).toHaveBeenLastCalledWith({
      ...vehicle,
      consentLowEmissionAccepted: true,
    });
  });

  it('disables looked-up fields and falls back to Bensin for a missing power type', () => {
    renderVehicleInfo({
      vehicle: { ...vehicle, powerType: null },
      disableVehicleFields: true,
    });

    for (const label of ['Manufacturer', 'Model', 'Serial number']) {
      expect(screen.getByLabelText(label)).toBeDisabled();
    }
    expect(screen.getByLabelText('Registration number')).not.toBeDisabled();
    expect(screen.getByTestId('vehicle-class-disabled')).toHaveTextContent(
      'true'
    );
    expect(screen.getByTestId('power-type')).toHaveTextContent('Bensin');
    expect(screen.getByTestId('power-type-disabled')).toHaveTextContent('true');
  });

  it('shows known restrictions and search errors, ignoring unknown codes', () => {
    renderVehicleInfo({
      vehicle: {
        ...vehicle,
        restrictions: ['03', '11', 'unknown'],
        updatedFromTraficomOn: '2030-01-15T10:30:00',
      },
      searchError: 'Vehicle lookup failed',
    });

    expect(screen.getByText(/Driving ban/)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle stolen/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Traficom has the following restriction notification/)
    ).toHaveLength(2);
    expect(screen.getByText('Vehicle lookup failed')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Source: Transport register, Traficom/).length
    ).toBeGreaterThan(0);
  });
});
