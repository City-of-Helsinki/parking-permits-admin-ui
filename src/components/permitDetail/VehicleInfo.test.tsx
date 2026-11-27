import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useUserRole, { UserRole } from '../../api/useUserRole';
import { ParkingPermitStatus } from '../../types';
import type {
  PermitDetail,
  PermitPrice,
  TemporaryVehicle,
  Vehicle,
} from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import VehicleInfo from './VehicleInfo';

vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));

const emptyPermit = getEmptyPermit();
const vehicle: Vehicle = {
  ...emptyPermit.vehicle,
  manufacturer: 'Original Motors',
  model: 'Model A',
  registrationNumber: 'ABC123',
  isLowEmission: true,
  updatedFromTraficomOn: '2030-01-15T10:30:00',
};
const permit: PermitDetail = {
  ...emptyPermit,
  id: 123,
  status: ParkingPermitStatus.VALID,
  consentLowEmissionAccepted: true,
  vehicle,
};
const temporaryVehicle: Vehicle = {
  ...vehicle,
  manufacturer: 'Temporary Motors',
  model: 'Model T',
  registrationNumber: 'TEMP123',
  updatedFromTraficomOn: '2030-02-01T10:30:00',
};
const activeTemporaryVehicle: TemporaryVehicle = {
  id: 'temporary-1',
  vehicle: temporaryVehicle,
  startTime: '2030-02-01T10:30:00',
  endTime: '2030-02-05T10:30:00',
  isActive: true,
};
const permitPrices: PermitPrice[] = [
  {
    unitPrice: 12.5,
    startDate: '2030-01-01T12:00:00',
    endDate: '2030-01-31T12:00:00',
    quantity: 1,
  },
];

const renderVehicleInfo = (
  options: {
    permit?: PermitDetail;
    permitPrices?: PermitPrice[];
    role?: UserRole;
    withRemoveHandler?: boolean;
  } = {}
) => {
  const callbacks = {
    openAddTempVehicle: vi.fn(),
    removeTemporaryVehicle: vi.fn(),
  };
  const user = userEvent.setup();

  vi.mocked(useUserRole).mockReturnValue(options.role ?? UserRole.SUPER_ADMIN);
  render(
    <VehicleInfo
      permit={options.permit ?? permit}
      permitPrices={options.permitPrices}
      openAddTempVehicle={callbacks.openAddTempVehicle}
      removeTemporaryVehicle={
        options.withRemoveHandler === false
          ? undefined
          : callbacks.removeTemporaryVehicle
      }
    />
  );

  return { ...callbacks, user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VehicleInfo', () => {
  it('renders vehicle details, prices, consent, attribution, and the add action', async () => {
    const { openAddTempVehicle, user } = renderVehicleInfo({ permitPrices });

    expect(screen.getByText('Vehicle information')).toBeVisible();
    expect(screen.getByText('ABC123 Original Motors Model A')).toBeVisible();
    expect(screen.getByText('Low emission vehicle')).toBeVisible();
    expect(screen.getByText('12.50 €/pm')).toBeVisible();
    expect(screen.getByText('(1.1.2030 - 31.1.2030)')).toBeVisible();
    expect(
      screen.getByLabelText(
        'Permission for a 50% discount on other off-road parking when paying with parking applications'
      )
    ).toBeChecked();
    expect(
      screen.getByText(/Source: Transport register, Traficom/)
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Add a temporary vehicle' })
    );

    expect(openAddTempVehicle).toHaveBeenCalledWith(true);
  });

  it.each([
    { role: UserRole.INSPECTORS, status: ParkingPermitStatus.VALID },
    { role: UserRole.CUSTOMER_SERVICE, status: ParkingPermitStatus.CANCELLED },
  ])(
    'hides the add action when role or status disallows it',
    ({ role, status }) => {
      renderVehicleInfo({
        role,
        permit: { ...permit, status },
      });

      expect(
        screen.queryByRole('button', { name: 'Add a temporary vehicle' })
      ).not.toBeInTheDocument();
    }
  );

  it('shows temporary vehicle details and removes it when requested', async () => {
    const { removeTemporaryVehicle, user } = renderVehicleInfo({
      permit: { ...permit, activeTemporaryVehicle },
    });

    expect(screen.getByText('TEMP123 Temporary Motors Model T')).toBeVisible();
    expect(screen.getByText('Temporary vehicle')).toBeVisible();
    expect(screen.getByText('1.2.2030 10:30 - 5.2.2030 10:30')).toBeVisible();
    expect(screen.getByText('Actual vehicle')).toBeVisible();
    expect(screen.getByText('ABC123 Original Motors Model A')).toBeVisible();
    expect(
      screen.getByText(
        'Source: Transport register, Traficom (fetched 1.2.2030 10:30)'
      )
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Remove temporary vehicle' })
    );

    expect(removeTemporaryVehicle).toHaveBeenCalledWith({
      variables: { permitId: '123' },
    });
  });

  it.each([
    { role: UserRole.INSPECTORS, withRemoveHandler: true },
    { role: UserRole.SUPER_ADMIN, withRemoveHandler: false },
  ])(
    'hides the remove action when role or handler is insufficient',
    ({ role, withRemoveHandler }) => {
      renderVehicleInfo({
        permit: { ...permit, activeTemporaryVehicle },
        role,
        withRemoveHandler,
      });

      expect(
        screen.queryByRole('button', { name: 'Remove temporary vehicle' })
      ).not.toBeInTheDocument();
    }
  );
});
