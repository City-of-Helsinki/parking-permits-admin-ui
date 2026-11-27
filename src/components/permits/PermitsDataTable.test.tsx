import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useUserRole, { UserRole } from '../../api/useUserRole';
import { ParkingPermitStatus, PermitContractType } from '../../types';
import type { PageInfo, Permit } from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import { OrderDirection } from '../types';
import PermitsDataTable from './PermitsDataTable';
import type { PermitsDataTableProps } from './PermitsDataTable';

const emptyPermit = getEmptyPermit();
const primaryAddress = {
  ...emptyPermit.address,
  streetName: 'Main Street',
  streetNameSv: 'Huvudgatan',
  streetNumber: '10',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
};
const otherAddress = {
  ...emptyPermit.address,
  streetName: 'Other Road',
  streetNameSv: 'Andra vägen',
  streetNumber: '20',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00200',
};
const customer = {
  ...emptyPermit.customer,
  firstName: 'Jane',
  lastName: 'Doe',
  nationalIdNumber: '010190-123A',
  primaryAddress,
  primaryAddressApartment: 'A 1',
  otherAddress,
  otherAddressApartment: 'B 2',
};
const permit: Permit = {
  id: 'permit-1',
  type: 'resident',
  customer,
  vehicle: {
    ...emptyPermit.vehicle,
    registrationNumber: 'ABC123',
  },
  parkingZone: {
    ...emptyPermit.parkingZone,
    name: 'Zone A',
  },
  status: ParkingPermitStatus.VALID,
  address: primaryAddress,
  startTime: '2030-01-01T10:00:00',
  endTime: '2030-02-01T10:00:00',
  primaryVehicle: true,
  canAdminExtendPermit: false,
  contractType: PermitContractType.FIXED_PERIOD,
  monthCount: 1,
  activeTemporaryVehicleRegistrationNumber: 'TEMP456',
};

const pageInfo: PageInfo = {
  numPages: 3,
  page: 1,
  prev: null,
  next: 2,
  startIndex: 0,
  endIndex: 1,
  count: 3,
};

vi.mock('../../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../../api/useUserRole')>()),
  default: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const renderPermitsTable = (
  overrides: Partial<PermitsDataTableProps> = {},
  role = UserRole.SUPER_ADMIN
) => {
  const callbacks = {
    onOrderBy: vi.fn(),
    onPage: vi.fn(),
    onRowClick: vi.fn(),
    onExport: vi.fn(),
  };
  const user = userEvent.setup();
  vi.mocked(useUserRole).mockReturnValue(role);

  render(
    <PermitsDataTable
      permits={[permit]}
      pageInfo={pageInfo}
      loading={false}
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('PermitsDataTable', () => {
  it('renders formatted permit details', () => {
    renderPermitsTable();

    const row = screen.getByRole('row', { name: /ABC123/ });
    expect(within(row).getByRole('cell', { name: 'Doe, Jane' })).toBeVisible();
    expect(
      within(row).getByRole('cell', { name: '010190-123A' })
    ).toBeVisible();
    expect(within(row).getByRole('cell', { name: 'TEMP456' })).toBeVisible();
    expect(
      within(row).getByRole('cell', {
        name: 'Main Street 10 A 1, 00100 Helsinki',
      })
    ).toBeVisible();
    expect(within(row).getByRole('cell', { name: 'Zone A' })).toBeVisible();
    expect(
      within(row).getByRole('cell', { name: '1.1.2030 10:00' })
    ).toBeVisible();
    expect(
      within(row).getByRole('cell', { name: '1.2.2030 10:00' })
    ).toBeVisible();
    expect(within(row).getByRole('cell', { name: '1. permit' })).toBeVisible();
    expect(within(row).getByRole('cell', { name: 'Valid' })).toBeVisible();
  });

  it('shows the other address and fallbacks for a secondary permit', () => {
    const secondaryPermit: Permit = {
      ...permit,
      id: 'permit-2',
      vehicle: {
        ...permit.vehicle,
        registrationNumber: 'XYZ789',
      },
      address: otherAddress,
      endTime: undefined,
      primaryVehicle: false,
      activeTemporaryVehicleRegistrationNumber: undefined,
    };
    renderPermitsTable({ permits: [secondaryPermit] });

    const row = screen.getByRole('row', { name: /XYZ789/ });
    expect(
      within(row).getByRole('cell', {
        name: 'Other Road 20 B 2, 00200 Helsinki',
      })
    ).toBeVisible();
    expect(within(row).getByRole('cell', { name: '2. permit' })).toBeVisible();
    expect(within(row).getAllByRole('cell', { name: '-' })).toHaveLength(3);
  });

  it('hides customer and address columns from inspectors', () => {
    renderPermitsTable({}, UserRole.INSPECTORS);

    for (const name of [
      'Name',
      'Personal identification number',
      'Primary address',
      'Temporary address',
    ]) {
      expect(
        screen.queryByRole('columnheader', { name })
      ).not.toBeInTheDocument();
    }
    expect(
      screen.getByRole('columnheader', { name: 'Registration number' })
    ).toBeInTheDocument();
  });

  it('forwards sorting, pagination, row click, and export actions', async () => {
    const { onExport, onOrderBy, onPage, onRowClick, user } =
      renderPermitsTable({
        orderBy: {
          orderField: 'name',
          orderDirection: OrderDirection.DESC,
        },
      });

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onOrderBy).toHaveBeenCalledWith({
      orderField: 'name',
      orderDirection: OrderDirection.ASC,
    });

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(onPage).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('row', { name: /ABC123/ }));
    expect(onRowClick).toHaveBeenCalledWith(permit);

    await user.click(
      screen.getByRole('button', { name: 'Download the results as a csv file' })
    );
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state instead of permit rows', () => {
    renderPermitsTable({ loading: true });

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Doe, Jane' })
    ).not.toBeInTheDocument();
  });
});
