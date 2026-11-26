import { ApolloError, useMutation } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import { ProductType, ProductUnit } from '../../../types';
import type { MutationResponse, ProductInput } from '../../../types';
import CreateProduct from './CreateProduct';

const mockNavigate = vi.fn();
const product: ProductInput = {
  type: ProductType.RESIDENT,
  zone: 'A',
  unitPrice: 30,
  unit: ProductUnit.MONTHLY,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  vatPercentage: 24,
  lowEmissionDiscountPercentage: 50,
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

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../components/superAdmin/products/ProductForm', () => ({
  default: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (product: ProductInput) => unknown;
    onCancel: () => void;
  }) => (
    <>
      <button type="button" onClick={() => onSubmit(product)}>
        Submit test product
      </button>
      <button type="button" onClick={onCancel}>
        Cancel product form
      </button>
    </>
  ),
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  Notification: ({
    children,
    onClose,
    closeButtonLabelText,
  }: {
    children: ReactNode;
    onClose?: () => void;
    closeButtonLabelText?: string;
  }) => (
    <div data-testid="notification">
      {children}
      <button onClick={onClose}>{closeButtonLabelText}</button>
    </div>
  ),
}));

const setupPage = () => {
  const user = userEvent.setup();
  render(<CreateProduct />);
  return user;
};

describe('CreateProduct', () => {
  const createProduct = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCallbacks = {};

    vi.mocked(useMutation).mockImplementation((_mutation, options) => {
      mutationCallbacks = {
        onCompleted: options?.onCompleted,
        onError: options?.onError,
      };
      return [createProduct] as unknown as ReturnType<typeof useMutation>;
    });
  });

  it('submits the product and navigates after successful creation', async () => {
    const user = setupPage();

    expect(
      screen.getByRole('heading', { name: 'Add new price' })
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Submit test product' })
    );

    expect(createProduct).toHaveBeenCalledWith({ variables: { product } });
    act(() => mutationCallbacks.onCompleted?.({ success: true }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('navigates back when the product form is canceled', async () => {
    const user = setupPage();

    await user.click(
      screen.getByRole('button', { name: 'Cancel product form' })
    );

    expect(createProduct).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('shows mutation errors and allows dismissing them', async () => {
    const user = setupPage();

    act(() => {
      mutationCallbacks.onError?.(
        new ApolloError({ errorMessage: 'Product creation failed' })
      );
    });
    expect(
      await screen.findByText('Product creation failed')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(
        screen.queryByText('Product creation failed')
      ).not.toBeInTheDocument()
    );
  });
});
