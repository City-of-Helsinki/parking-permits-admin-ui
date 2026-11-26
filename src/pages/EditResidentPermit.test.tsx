import {
  ApolloError,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DocumentNode } from 'graphql';
import type { ComponentType, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getEmptyPermit } from '../components/residentPermit/consts';
import type {
  Address,
  PermitDetail,
  PermitPrice,
  PermitPriceChange,
} from '../types';
import EditResidentPermit from './EditResidentPermit';
import { convertAddressToAddressInput, convertToPermitInput } from '../utils';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getPermitPriceChangeList: vi.fn(),
  getPermitPrices: vi.fn(),
  updateResidentPermit: vi.fn(),
}));

type QueryCallbacks = {
  onCompleted?: (data: unknown) => void;
  onError?: (error: ApolloError) => void;
};

const lazyQueryCallbacks = new Map<string, QueryCallbacks>();
let permitQueryCallbacks: QueryCallbacks = {};
let mutationCallbacks: QueryCallbacks = {};
const emptyPermit = getEmptyPermit();
const VAT_RATE = 0.2;
const NEGATIVE_PRICE_CHANGE = -2;
const POSITIVE_PRICE_CHANGE = 2;
const zoneA = { name: 'A', label: 'Zone A', labelSv: 'Zon A' };
const zoneB = { name: 'B', label: 'Zone B', labelSv: 'Zon B' };
const permitAddress: Address = {
  ...emptyPermit.address,
  id: 'address-1',
  streetName: 'Test Street',
  streetNumber: '10',
  location: [0, 0],
  zone: zoneA,
};
const permitPrice: PermitPrice = {
  unitPrice: 10,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  quantity: 1,
};
const permitDetail: PermitDetail = {
  ...emptyPermit,
  id: 123,
  customer: {
    ...emptyPermit.customer,
    firstName: 'Jane',
    lastName: 'Doe',
    nationalIdNumber: '123456-7890',
    zone: zoneA,
  },
  vehicle: {
    ...emptyPermit.vehicle,
    registrationNumber: 'ABC123',
  },
  address: permitAddress,
  parkingZone: zoneB,
  permitPrices: [permitPrice],
};
const loadedPermit: PermitDetail = {
  ...permitDetail,
  customer: { ...permitDetail.customer, zone: zoneB },
  disableVehicleFields: true,
};
const updatedPrices: PermitPrice[] = [
  permitPrice,
  { ...permitPrice, unitPrice: 12 },
];

const priceChange = (amount: number): PermitPriceChange => ({
  product: 'Resident permit',
  previousPrice: 10,
  newPrice: 10 + amount,
  priceChange: amount,
  priceChangeVat: amount * VAT_RATE,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  monthCount: 1,
});

const getOperationName = (query: DocumentNode) => {
  const operation = query.definitions[0];
  if (operation?.kind !== 'OperationDefinition' || !operation.name) {
    throw new Error('Expected a named GraphQL operation');
  }
  return operation.name.value;
};

const completePermitQuery = (permit: PermitDetail) => {
  const onCompleted = permitQueryCallbacks.onCompleted;
  if (!onCompleted) {
    throw new Error('No permit query completion callback registered');
  }
  act(() => onCompleted({ permitDetail: permit }));
};

const completeLazyQuery = (name: string, data: unknown) => {
  const onCompleted = lazyQueryCallbacks.get(name)?.onCompleted;
  if (!onCompleted) {
    throw new Error(`No completion callback registered for ${name}`);
  }
  act(() => onCompleted(data));
};

const failPermitQuery = (errorMessage: string) => {
  const onError = permitQueryCallbacks.onError;
  if (!onError) {
    throw new Error('No permit query error callback registered');
  }
  act(() => onError(new ApolloError({ errorMessage })));
};

const failLazyQuery = (name: string, errorMessage: string) => {
  const onError = lazyQueryCallbacks.get(name)?.onError;
  if (!onError) {
    throw new Error(`No error callback registered for ${name}`);
  }
  act(() => onError(new ApolloError({ errorMessage })));
};

const completeMutation = () => {
  const onCompleted = mutationCallbacks.onCompleted;
  if (!onCompleted) {
    throw new Error('No mutation completion callback registered');
  }
  act(() => onCompleted({ success: true }));
};

const failMutation = (errorMessage: string) => {
  const onError = mutationCallbacks.onError;
  if (!onError) {
    throw new Error('No mutation error callback registered');
  }
  act(() => onError(new ApolloError({ errorMessage })));
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../components/residentPermit/EditResidentPermitForm', () => ({
  default: ({
    permit,
    permitPrices,
    onResetPermit,
    onResetVehicle,
    onClearVehicle,
    onUpdatePermit,
    onCancel,
    onConfirm,
  }: {
    permit: PermitDetail;
    permitPrices: PermitPrice[];
    onResetPermit: (nationalIdNumber: string) => void;
    onResetVehicle: (regNumber: string) => void;
    onClearVehicle: () => void;
    onUpdatePermit: (permit: PermitDetail) => void;
    onCancel: () => void;
    onConfirm: () => void;
  }) => (
    <div data-testid="resident-permit-form">
      <div data-testid="customer-personal-id">
        {permit.customer.nationalIdNumber}
      </div>
      <div data-testid="customer-zone">{permit.customer.zone?.name}</div>
      <div data-testid="vehicle-registration">
        {permit.vehicle.registrationNumber}
      </div>
      <div data-testid="vehicle-disabled">
        {String(permit.disableVehicleFields)}
      </div>
      <div data-testid="permit-price-count">{permitPrices.length}</div>
      <button
        onClick={() => onUpdatePermit({ ...permit, primaryVehicle: false })}>
        Set secondary permit
      </button>
      <button
        onClick={() =>
          onUpdatePermit({
            ...permit,
            vehicle: { ...permit.vehicle, registrationNumber: '' },
          })
        }>
        Make permit invalid
      </button>
      <button onClick={() => onResetPermit('999999-9999')}>
        Reset customer
      </button>
      <button onClick={() => onResetVehicle('RESET123')}>Reset vehicle</button>
      <button onClick={onClearVehicle}>Clear vehicle</button>
      <button onClick={onCancel}>Cancel edit</button>
      <button onClick={onConfirm}>Continue to preview</button>
    </div>
  ),
}));

vi.mock('../components/residentPermit/EditResidentPermitPreview', () => ({
  default: ({
    permit,
    priceChangeList,
    refundAccountNumber,
    onChangeRefundAccountNumber,
    onCancel,
    onConfirm,
  }: {
    permit: PermitDetail;
    priceChangeList: PermitPriceChange[];
    refundAccountNumber: string;
    onChangeRefundAccountNumber: (accountNumber: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
  }) => (
    <div data-testid="resident-permit-preview">
      <div data-testid="preview-customer">
        {permit.customer.nationalIdNumber}
      </div>
      <div data-testid="price-change-count">{priceChangeList.length}</div>
      <div data-testid="refund-account-number">{refundAccountNumber}</div>
      <button onClick={() => onChangeRefundAccountNumber('FI1234567890123456')}>
        Set refund account
      </button>
      <button onClick={onCancel}>Back to edit</button>
      <button onClick={onConfirm}>Save preview</button>
    </div>
  ),
}));

vi.mock('../components/common/ConfirmDialog', () => ({
  default: ({
    isOpen,
    title,
    message,
    secondaryMessage,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    secondaryMessage: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <p>{message}</p>
        <p>{secondaryMessage}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>{cancelLabel}</button>
      </div>
    ) : null,
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

const renderEditPermit = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/permits/123/edit']}>
      <Routes>
        <Route path="/permits/:id/edit" element={<EditResidentPermit />} />
      </Routes>
    </MemoryRouter>
  );
  return user;
};

const renderLoadedPermit = () => {
  const user = renderEditPermit();
  completePermitQuery(permitDetail);
  return user;
};

const loadPriceChanges = async (
  user: ReturnType<typeof userEvent.setup>,
  changes: PermitPriceChange[]
) => {
  await user.click(screen.getByRole('button', { name: 'Continue to preview' }));
  completeLazyQuery('GetPriceChangeList', {
    permitPriceChangeList: changes,
  });
};

const expectErrorToBeDismissible = async (
  user: ReturnType<typeof userEvent.setup>,
  errorMessage: string
) => {
  expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
};

beforeEach(() => {
  vi.resetAllMocks();
  lazyQueryCallbacks.clear();
  permitQueryCallbacks = {};
  mutationCallbacks = {};

  vi.mocked(useQuery).mockImplementation((_query, options) => {
    permitQueryCallbacks = {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    };
    return { loading: true } as unknown as ReturnType<typeof useQuery>;
  });

  vi.mocked(useLazyQuery).mockImplementation((query, options) => {
    const operationName = getOperationName(query);
    lazyQueryCallbacks.set(operationName, {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
    if (operationName === 'GetPriceChangeList') {
      return [mocks.getPermitPriceChangeList] as unknown as ReturnType<
        typeof useLazyQuery
      >;
    }
    if (operationName === 'GetPermitPrices') {
      return [mocks.getPermitPrices] as unknown as ReturnType<
        typeof useLazyQuery
      >;
    }
    throw new Error(`Unexpected lazy query: ${operationName}`);
  });

  vi.mocked(useMutation).mockImplementation((_mutation, options) => {
    mutationCallbacks = {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    };
    return [mocks.updateResidentPermit] as unknown as ReturnType<
      typeof useMutation
    >;
  });
});

describe('EditResidentPermit', () => {
  it('loads the permit and initializes its zone, vehicle state, and prices', () => {
    renderEditPermit();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { permitId: '123' },
        fetchPolicy: 'no-cache',
      })
    );

    completePermitQuery(permitDetail);

    expect(screen.getByTestId('resident-permit-form')).toBeInTheDocument();
    expect(screen.getByTestId('customer-zone')).toHaveTextContent('B');
    expect(screen.getByTestId('vehicle-disabled')).toHaveTextContent('true');
    expect(screen.getByTestId('permit-price-count')).toHaveTextContent('1');
  });

  it('fetches updated prices for a secondary permit and skips invalid permit data', async () => {
    const user = renderLoadedPermit();
    const secondaryPermit = { ...loadedPermit, primaryVehicle: false };

    await user.click(
      screen.getByRole('button', { name: 'Set secondary permit' })
    );

    expect(mocks.getPermitPrices).toHaveBeenCalledWith({
      variables: {
        permit: convertToPermitInput(secondaryPermit),
        isSecondary: true,
      },
    });
    completeLazyQuery('GetPermitPrices', {
      permitPrices: updatedPrices,
    });
    expect(screen.getByTestId('permit-price-count')).toHaveTextContent('2');

    mocks.getPermitPrices.mockClear();
    await user.click(
      screen.getByRole('button', { name: 'Make permit invalid' })
    );
    expect(mocks.getPermitPrices).not.toHaveBeenCalled();
  });

  it('requests a preview and returns to editing when the preview is canceled', async () => {
    const user = renderLoadedPermit();

    await user.click(
      screen.getByRole('button', { name: 'Continue to preview' })
    );
    expect(mocks.getPermitPriceChangeList).toHaveBeenCalledWith({
      variables: {
        permitId: '123',
        permitInfo: convertToPermitInput(loadedPermit),
      },
    });
    expect(
      screen.queryByTestId('resident-permit-form')
    ).not.toBeInTheDocument();

    completeLazyQuery('GetPriceChangeList', {
      permitPriceChangeList: [priceChange(NEGATIVE_PRICE_CHANGE)],
    });
    expect(screen.getByTestId('resident-permit-preview')).toBeInTheDocument();
    expect(screen.getByTestId('price-change-count')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'Back to edit' }));
    expect(screen.getByTestId('resident-permit-form')).toBeInTheDocument();
    expect(
      screen.queryByTestId('resident-permit-preview')
    ).not.toBeInTheDocument();
  });

  it('updates directly when there is no extra payment', async () => {
    const user = renderLoadedPermit();
    await loadPriceChanges(user, [priceChange(NEGATIVE_PRICE_CHANGE)]);

    await user.click(
      screen.getByRole('button', { name: 'Set refund account' })
    );
    await user.click(screen.getByRole('button', { name: 'Save preview' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.updateResidentPermit).toHaveBeenCalledWith({
      variables: {
        permitId: '123',
        permitInfo: {
          ...convertToPermitInput(loadedPermit),
          address: convertAddressToAddressInput(loadedPermit.address),
          zone: zoneB.name,
        },
        iban: 'FI1234567890123456',
      },
    });

    completeMutation();
    expect(mocks.navigate).toHaveBeenCalledWith('/permits/123');
  });

  it('requires confirmation for extra payment before updating', async () => {
    const user = renderLoadedPermit();
    await loadPriceChanges(user, [priceChange(POSITIVE_PRICE_CHANGE)]);

    await user.click(screen.getByRole('button', { name: 'Save preview' }));
    expect(
      screen.getByRole('dialog', { name: 'Confirm Payment' })
    ).toBeVisible();
    expect(mocks.updateResidentPermit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel payment' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.updateResidentPermit).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save preview' }));
    await user.click(screen.getByRole('button', { name: 'Payment completed' }));
    expect(mocks.updateResidentPermit).toHaveBeenCalledTimes(1);

    completeMutation();
    expect(mocks.navigate).toHaveBeenCalledWith('/permits/123');
  });

  it('resets customer and vehicle state and navigates back on cancel', async () => {
    const user = renderLoadedPermit();

    await user.click(screen.getByRole('button', { name: 'Reset customer' }));
    expect(screen.getByTestId('customer-personal-id')).toHaveTextContent(
      '999999-9999'
    );

    await user.click(screen.getByRole('button', { name: 'Reset vehicle' }));
    expect(screen.getByTestId('vehicle-registration')).toHaveTextContent(
      'RESET123'
    );
    await user.click(screen.getByRole('button', { name: 'Clear vehicle' }));
    expect(screen.getByTestId('vehicle-registration')).toBeEmptyDOMElement();
    expect(screen.getByTestId('vehicle-disabled')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', { name: 'Cancel edit' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/permits/123');
  });

  it('shows and dismisses query, pricing, and mutation errors', async () => {
    const user = renderLoadedPermit();

    failPermitQuery('Permit lookup failed');
    await expectErrorToBeDismissible(user, 'Permit lookup failed');

    await user.click(
      screen.getByRole('button', { name: 'Continue to preview' })
    );
    failLazyQuery('GetPriceChangeList', 'Price change lookup failed');
    await expectErrorToBeDismissible(user, 'Price change lookup failed');

    completeLazyQuery('GetPriceChangeList', {
      permitPriceChangeList: [priceChange(NEGATIVE_PRICE_CHANGE)],
    });
    await user.click(screen.getByRole('button', { name: 'Save preview' }));
    failMutation('Permit update failed');
    await expectErrorToBeDismissible(user, 'Permit update failed');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
