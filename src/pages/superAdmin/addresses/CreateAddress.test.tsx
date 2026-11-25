import { ApolloError, useMutation } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { getEmptyPermit } from '../../../components/residentPermit/consts';
import { Address, MutationResponse } from '../../../types';
import CreateAddress from './CreateAddress';

const mockNavigate = vi.fn();
const address: Address = {
  ...getEmptyPermit().address,
  streetName: 'Test Street',
  streetNumber: '10',
  city: 'Helsinki',
  postalCode: '00100',
};
let mutationCallbacks: {
  onCompleted?: (data: MutationResponse) => void;
  onError?: (error: ApolloError) => void;
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: () => [true, true, true, true],
}));

vi.mock('../../../components/superAdmin/addresses/AddressForm', () => ({
  default: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (address: Address) => unknown;
    onCancel: () => void;
  }) => (
    <>
      <button type="button" onClick={() => onSubmit(address)}>
        submit test address
      </button>
      <button type="button" onClick={onCancel}>
        cancel address form
      </button>
    </>
  ),
}));

const setupPage = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/admin/addresses/create']}>
      <Routes>
        <Route path="/admin/addresses/create" element={<CreateAddress />} />
      </Routes>
    </MemoryRouter>
  );
  return user;
};

describe('CreateAddress', () => {
  const createAddress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCallbacks = {};

    vi.mocked(useMutation).mockImplementation((_mutation, options) => {
      mutationCallbacks = {
        onCompleted: options?.onCompleted,
        onError: options?.onError,
      };
      return [createAddress] as unknown as ReturnType<typeof useMutation>;
    });
  });

  it('submits the address and navigates after successful creation', async () => {
    const user = setupPage();

    expect(
      screen.getByRole('heading', { name: 'Add new address' })
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'submit test address' })
    );

    expect(createAddress).toHaveBeenCalledWith({ variables: { address } });
    act(() => mutationCallbacks.onCompleted?.({ success: true }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/addresses');
  });

  it('navigates back when the address form is canceled', async () => {
    const user = setupPage();

    await user.click(
      screen.getByRole('button', { name: 'cancel address form' })
    );

    expect(createAddress).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/addresses');
  });

  it('shows mutation errors and allows dismissing them', async () => {
    const user = setupPage();

    act(() => {
      mutationCallbacks.onError?.(
        new ApolloError({ errorMessage: 'Address creation failed' })
      );
    });
    expect(
      await screen.findByText('Address creation failed')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        screen.queryByText('Address creation failed')
      ).not.toBeInTheDocument()
    );
  });
});
