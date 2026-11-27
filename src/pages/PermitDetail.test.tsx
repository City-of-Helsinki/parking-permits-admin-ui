import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DocumentNode } from 'graphql';
import type { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import { ParkingPermitStatus, PermitEndType } from '../types';
import type {
  ChangeLog,
  MutationResponse,
  PermitDetail,
  TemporaryVehicle,
} from '../types';
import { getEmptyPermit } from '../components/residentPermit/consts';
import PermitDetailPage from './PermitDetail';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  refetch: vi.fn(),
  exportData: vi.fn(),
  formatExportUrlPdf: vi.fn(() => 'permit-pdf'),
  useUserRole: vi.fn(),
  addTemporaryVehicle: vi.fn(),
  removeTemporaryVehicle: vi.fn(),
  temporaryVehicle: {
    registrationNumber: 'TEMP123',
    startTime: '2030-01-01T10:00:00',
    endTime: '2030-01-02T10:00:00',
  },
}));

type MutationCallbacks = {
  onCompleted?: (data: MutationResponse) => void;
  onError?: (error: ApolloError) => void;
};

const mutationCallbacks = new Map<string, MutationCallbacks>();
let queryErrorCallback: ((error: ApolloError) => void) | undefined;
let queryLoading = false;
let queryPermit: PermitDetail;

const getMutationFieldName = (query: DocumentNode) => {
  const operation = query.definitions.find(
    definition => definition.kind === 'OperationDefinition'
  );
  if (operation?.kind !== 'OperationDefinition') {
    throw new Error('Expected a GraphQL operation');
  }
  const field = operation.selectionSet.selections.find(
    selection => selection.kind === 'Field'
  );
  if (field?.kind !== 'Field') {
    throw new Error('Expected a mutation field');
  }
  return field.name.value;
};

const completeMutation = (fieldName: string) => {
  const onCompleted = mutationCallbacks.get(fieldName)?.onCompleted;
  if (!onCompleted) {
    throw new Error(`No completion callback registered for ${fieldName}`);
  }
  act(() => onCompleted({ success: true }));
};

const failQuery = (message: string) => {
  if (!queryErrorCallback) {
    throw new Error('No permit query error callback registered');
  }
  act(() => queryErrorCallback?.(new ApolloError({ errorMessage: message })));
};

const failMutation = (fieldName: string, message: string) => {
  const onError = mutationCallbacks.get(fieldName)?.onError;
  if (!onError) {
    throw new Error(`No error callback registered for ${fieldName}`);
  }
  act(() => onError(new ApolloError({ errorMessage: message })));
};

const emptyPermit = getEmptyPermit();
const permit: PermitDetail = {
  ...emptyPermit,
  id: 123,
  customer: {
    ...emptyPermit.customer,
    firstName: 'Jane',
    lastName: 'Doe',
  },
  vehicle: {
    ...emptyPermit.vehicle,
    registrationNumber: 'ABC123',
  },
  status: ParkingPermitStatus.VALID,
  canEndImmediately: true,
  canEndAfterCurrentPeriod: true,
};

const activeTemporaryVehicle: TemporaryVehicle = {
  id: 'temporary-1',
  vehicle: {
    ...permit.vehicle,
    registrationNumber: mocks.temporaryVehicle.registrationNumber,
  },
  startTime: mocks.temporaryVehicle.startTime,
  endTime: mocks.temporaryVehicle.endTime,
  isActive: true,
};

queryPermit = permit;

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../api/useUserRole', async importOriginal => ({
  ...(await importOriginal<typeof import('../api/useUserRole')>()),
  default: mocks.useUserRole,
}));

vi.mock('../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../components/common/ChangeLogs', () => ({
  default: ({ changeLogs }: { changeLogs: ChangeLog[] }) => (
    <div data-testid="change-logs">{changeLogs.length}</div>
  ),
}));

vi.mock('../components/common/StatusTag', () => ({
  default: ({ status }: { status: ParkingPermitStatus }) => (
    <div data-testid="permit-status">{status}</div>
  ),
}));

vi.mock('../components/common/Zone', () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid="permit-zone">{name}</div>
  ),
}));

vi.mock('../components/permitDetail/CustomerInfo', () => ({
  default: () => <div data-testid="customer-info" />,
}));

vi.mock('../components/permitDetail/PermitInfo', () => ({
  default: () => <div data-testid="permit-info" />,
}));

vi.mock('../components/permitDetail/VehicleInfo', () => ({
  default: ({
    permit: currentPermit,
    openAddTempVehicle,
    removeTemporaryVehicle,
  }: {
    permit: PermitDetail;
    openAddTempVehicle?: (open: boolean) => void;
    removeTemporaryVehicle?: (options: {
      variables: { permitId: string };
    }) => void;
  }) => (
    <div data-testid="vehicle-info">
      {currentPermit.activeTemporaryVehicle ? (
        <button
          onClick={() =>
            removeTemporaryVehicle?.({
              variables: { permitId: `${currentPermit.id}` },
            })
          }>
          Remove temporary vehicle
        </button>
      ) : (
        <button onClick={() => openAddTempVehicle?.(true)}>
          Open temporary vehicle form
        </button>
      )}
    </div>
  ),
}));

vi.mock('../components/permitDetail/TemporaryVehicle', () => ({
  default: ({
    permit: currentPermit,
    cancelAddTempVehicle,
    addTemporaryVehicle,
  }: {
    permit?: PermitDetail;
    cancelAddTempVehicle: (open: boolean) => void;
    addTemporaryVehicle: (options: {
      variables: {
        permitId: string;
        registrationNumber: string;
        startTime: string;
        endTime: string;
      };
    }) => void;
  }) => (
    <div data-testid="temporary-vehicle-form">
      <button
        onClick={() =>
          addTemporaryVehicle({
            variables: {
              permitId: `${currentPermit?.id}`,
              ...mocks.temporaryVehicle,
            },
          })
        }>
        Save temporary vehicle
      </button>
      <button onClick={() => cancelAddTempVehicle(false)}>
        Cancel temporary vehicle
      </button>
    </div>
  ),
}));

vi.mock('../components/permitDetail/EndPermitDialog', () => ({
  default: ({
    isOpen,
    onCancel,
    onConfirm,
  }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: (endType: PermitEndType) => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="End permit">
        <button onClick={onCancel}>Cancel end</button>
        <button onClick={() => onConfirm(PermitEndType.AFTER_CURRENT_PERIOD)}>
          Confirm end after period
        </button>
      </div>
    ) : null,
}));

vi.mock('../export/useExportData', () => ({
  default: () => mocks.exportData,
}));

vi.mock('../export/utils', () => ({
  formatExportUrlPdf: mocks.formatExportUrlPdf,
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  Notification: ({
    children,
    onClose,
  }: {
    children: ReactNode;
    onClose?: () => void;
  }) => (
    <div data-testid="notification">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const renderPermitDetail = (
  currentPermit = permit,
  role = UserRole.SUPER_ADMIN
) => {
  const user = userEvent.setup();
  queryPermit = currentPermit;
  vi.mocked(useUserRole).mockReturnValue(role);
  render(
    <MemoryRouter initialEntries={[`/permits/${currentPermit.id}`]}>
      <Routes>
        <Route path="/permits/:id" element={<PermitDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.resetAllMocks();
  mutationCallbacks.clear();
  queryErrorCallback = undefined;
  queryLoading = false;
  queryPermit = permit;
  vi.mocked(useUserRole).mockReturnValue(UserRole.SUPER_ADMIN);

  vi.mocked(useQuery).mockImplementation((_query, options) => {
    queryErrorCallback = options?.onError;
    return {
      loading: queryLoading,
      data: queryLoading ? undefined : { permitDetail: queryPermit },
      refetch: mocks.refetch,
    } as unknown as ReturnType<typeof useQuery>;
  });

  vi.mocked(useMutation).mockImplementation((mutation, options) => {
    const fieldName = getMutationFieldName(mutation);
    mutationCallbacks.set(fieldName, {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
    if (fieldName === 'addTemporaryVehicle') {
      return [mocks.addTemporaryVehicle] as unknown as ReturnType<
        typeof useMutation
      >;
    }
    if (fieldName === 'removeTemporaryVehicle') {
      return [mocks.removeTemporaryVehicle] as unknown as ReturnType<
        typeof useMutation
      >;
    }
    throw new Error(`Unexpected mutation field: ${fieldName}`);
  });
});

describe('PermitDetail', () => {
  it('shows loading while permit details are being fetched', () => {
    queryLoading = true;
    renderPermitDetail();

    expect(screen.getByText('pages.permitDetail.loading')).toBeInTheDocument();
    expect(screen.queryByTestId('vehicle-info')).not.toBeInTheDocument();
  });

  it('renders permit details and admin controls for a super admin', () => {
    renderPermitDetail();

    expect(screen.getByText('Doe, Jane')).toBeVisible();
    expect(screen.getByTestId('permit-zone')).toHaveTextContent(
      permit.parkingZone.name
    );
    expect(screen.getByTestId('permit-status')).toHaveTextContent(
      ParkingPermitStatus.VALID
    );
    expect(screen.getByTestId('change-logs')).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-info')).toBeInTheDocument();
    expect(screen.getByTestId('customer-info')).toBeInTheDocument();
    expect(screen.getByTestId('permit-info')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Download permit details as PDF' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'End permit' })).toBeVisible();
  });

  it('hides change history and administrative controls from inspectors', () => {
    renderPermitDetail(permit, UserRole.INSPECTORS);

    expect(screen.getByText('Doe, Jane')).toBeVisible();
    expect(screen.queryByTestId('change-logs')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Download permit details as PDF' })
    ).not.toBeInTheDocument();
  });

  it.each([
    { status: ParkingPermitStatus.DRAFT, destination: 'create' },
    { status: ParkingPermitStatus.PRELIMINARY, destination: 'create' },
    { status: ParkingPermitStatus.VALID, destination: 'edit' },
  ])(
    'navigates to $destination when editing a $status permit',
    async ({ status, destination }) => {
      const user = renderPermitDetail({ ...permit, status });

      await user.click(screen.getByRole('button', { name: 'Edit' }));

      expect(mocks.navigate).toHaveBeenCalledWith(destination);
    }
  );

  it('exports the permit PDF and opens the end dialog', async () => {
    const user = renderPermitDetail();

    await user.click(
      screen.getByRole('button', { name: 'Download permit details as PDF' })
    );
    expect(mocks.formatExportUrlPdf).toHaveBeenCalledWith(
      'permit',
      `${permit.id}`
    );
    expect(mocks.exportData).toHaveBeenCalledWith('permit-pdf');

    await user.click(screen.getByRole('button', { name: 'End permit' }));
    expect(screen.getByRole('dialog', { name: 'End permit' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cancel end' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'End permit' }));
    await user.click(
      screen.getByRole('button', { name: 'Confirm end after period' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('end/after_current_period');
  });

  it('adds a temporary vehicle and refetches permit details on success', async () => {
    const user = renderPermitDetail();

    await user.click(
      screen.getByRole('button', { name: 'Open temporary vehicle form' })
    );
    expect(screen.getByTestId('temporary-vehicle-form')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Save temporary vehicle' })
    );

    expect(mocks.addTemporaryVehicle).toHaveBeenCalledWith({
      variables: {
        permitId: `${permit.id}`,
        ...mocks.temporaryVehicle,
      },
    });
    completeMutation('addTemporaryVehicle');

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('temporary-vehicle-form')
    ).not.toBeInTheDocument();
  });

  it('removes an active temporary vehicle and refetches permit details', async () => {
    const user = renderPermitDetail({
      ...permit,
      activeTemporaryVehicle,
    });

    await user.click(
      screen.getByRole('button', { name: 'Remove temporary vehicle' })
    );
    expect(mocks.removeTemporaryVehicle).toHaveBeenCalledWith({
      variables: { permitId: `${permit.id}` },
    });

    completeMutation('removeTemporaryVehicle');

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  it('shows and dismisses permit query errors', async () => {
    const user = renderPermitDetail({
      ...permit,
      activeTemporaryVehicle,
    });
    failQuery('Permit lookup failed');

    expect(screen.getByText('Permit lookup failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Permit lookup failed')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remove temporary vehicle' })
    );
    failMutation('removeTemporaryVehicle', 'Temporary vehicle removal failed');
    expect(
      screen.getByText('Temporary vehicle removal failed')
    ).toBeInTheDocument();
  });
});
