import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import type { DocumentNode } from 'graphql';
import { Address, MutationResponse } from '../../../types';
import EditAddress from './EditAddress';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
}));

type MutationCallbacks = {
  onCompleted?: (data: MutationResponse) => void;
  onError?: (error: ApolloError) => void;
};

const mutationCallbacks = new Map<string, MutationCallbacks>();
let onQueryError: ((error: ApolloError) => void) | undefined;

const getOperationName = (query: DocumentNode) => {
  const operation = query.definitions[0];
  if (operation?.kind !== 'OperationDefinition' || !operation.name) {
    throw new Error('Expected a named GraphQL operation');
  }
  return operation.name.value;
};

const address: Address = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Testgatan',
  streetNumber: '10',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  postalCode: '00100',
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ id: 'address-1' }),
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../components/superAdmin/addresses/AddressForm', () => ({
  default: ({
    address: loadedAddress,
    onSubmit,
    onDelete,
    onCancel,
  }: {
    address?: Address;
    onSubmit: (address: Address) => unknown;
    onDelete?: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <div data-testid="loaded-address">{loadedAddress?.streetName}</div>
      <button
        onClick={() =>
          loadedAddress &&
          onSubmit({ ...loadedAddress, streetName: 'Updated Street' })
        }>
        Submit address
      </button>
      <button onClick={onDelete}>Request delete</button>
      <button onClick={onCancel}>Cancel edit</button>
    </div>
  ),
}));

vi.mock('../../../components/common/ConfirmDialog', () => ({
  default: ({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <p>{message}</p>
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

const renderEditAddress = () => {
  const user = userEvent.setup();
  render(<EditAddress />);
  return user;
};

const expectErrorToBeDismissible = async (
  user: ReturnType<typeof userEvent.setup>,
  message: string
) => {
  expect(screen.getByText(message)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByText(message)).not.toBeInTheDocument();
};

beforeEach(() => {
  vi.clearAllMocks();
  mutationCallbacks.clear();
  onQueryError = undefined;

  vi.mocked(useQuery).mockImplementation((_query, options) => {
    onQueryError = options?.onError;
    return {
      loading: false,
      data: { address },
    } as unknown as ReturnType<typeof useQuery>;
  });

  vi.mocked(useMutation).mockImplementation((mutation, options) => {
    const operationName = getOperationName(mutation);
    mutationCallbacks.set(operationName, {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
    const mutate =
      operationName === 'UpdateAddress'
        ? mocks.updateAddress
        : mocks.deleteAddress;
    return [mutate] as unknown as ReturnType<typeof useMutation>;
  });
});

describe('EditAddress', () => {
  it('loads the address for the route id', () => {
    renderEditAddress();

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { addressId: 'address-1' },
        fetchPolicy: 'no-cache',
      })
    );
    expect(screen.getByTestId('loaded-address')).toHaveTextContent(
      'Test Street'
    );
  });

  it('shows a loading state while the address is fetched', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    renderEditAddress();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit address' })).toBeNull();
  });

  it('does not render the form when no address is returned', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    renderEditAddress();

    expect(
      screen.getByRole('heading', { name: 'Edit address' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('loaded-address')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit address' })
    ).not.toBeInTheDocument();
  });

  it('submits the updated address and navigates after success', async () => {
    const user = renderEditAddress();

    await user.click(screen.getByRole('button', { name: 'Submit address' }));

    expect(mocks.updateAddress).toHaveBeenCalledWith({
      variables: {
        addressId: 'address-1',
        address: { ...address, streetName: 'Updated Street' },
      },
    });
    act(() => {
      mutationCallbacks.get('UpdateAddress')?.onCompleted?.({ success: true });
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/addresses');
  });

  it('navigates back when editing is canceled', async () => {
    const user = renderEditAddress();

    await user.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/admin/addresses');
    expect(mocks.updateAddress).not.toHaveBeenCalled();
  });

  it('opens the delete confirmation and cancels without deleting', async () => {
    const user = renderEditAddress();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    expect(
      screen.getByRole('dialog', { name: 'Confirm delete' })
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.deleteAddress).not.toHaveBeenCalled();
  });

  it('deletes the address after confirmation and navigates on success', async () => {
    const user = renderEditAddress();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(mocks.deleteAddress).toHaveBeenCalledWith({
      variables: { addressId: 'address-1' },
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      mutationCallbacks.get('DeleteAddress')?.onCompleted?.({ success: true });
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/addresses');
  });

  it('shows and dismisses query errors', async () => {
    const user = renderEditAddress();

    act(() => {
      onQueryError?.(new ApolloError({ errorMessage: 'Address query failed' }));
    });
    await expectErrorToBeDismissible(user, 'Address query failed');
  });

  it('shows and dismisses mutation errors', async () => {
    const user = renderEditAddress();

    act(() => {
      mutationCallbacks
        .get('UpdateAddress')
        ?.onError?.(new ApolloError({ errorMessage: 'Address update failed' }));
    });
    await expectErrorToBeDismissible(user, 'Address update failed');
  });

  it('shows and dismisses delete errors without navigating', async () => {
    const user = renderEditAddress();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    act(() => {
      mutationCallbacks
        .get('DeleteAddress')
        ?.onError?.(new ApolloError({ errorMessage: 'Address delete failed' }));
    });

    await expectErrorToBeDismissible(user, 'Address delete failed');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
