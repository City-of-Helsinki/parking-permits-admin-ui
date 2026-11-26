import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DocumentNode } from 'graphql';
import type { ComponentType, ReactNode } from 'react';
import { ProductType, ProductUnit } from '../../../types';
import type { MutationResponse, Product, ProductInput } from '../../../types';
import EditProduct from './EditProduct';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
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

const productInput: ProductInput = {
  type: ProductType.COMPANY,
  zone: 'B',
  unitPrice: 10,
  unit: ProductUnit.PIECES,
  startDate: '2030-01-10',
  endDate: '2030-02-20',
  vatPercentage: 20,
  lowEmissionDiscountPercentage: 5,
};

const product: Product = {
  ...productInput,
  id: 'product-1',
  vat: 2,
  lowEmissionDiscount: 0.5,
  secondaryVehicleIncreaseRate: 25,
  modifiedAt: '2030-01-01T10:00:00.000Z',
  modifiedBy: 'Admin',
};

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ id: 'product-1' }),
}));

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../components/superAdmin/products/ProductForm', () => ({
  default: ({
    product: loadedProduct,
    onSubmit,
    onDelete,
    onCancel,
  }: {
    product?: Product;
    onSubmit: (product: ProductInput) => unknown;
    onDelete?: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <div data-testid="loaded-product">{loadedProduct?.id}</div>
      <button onClick={() => onSubmit(productInput)}>Submit product</button>
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

const renderEditProduct = () => {
  const user = userEvent.setup();
  render(<EditProduct />);
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
      data: { product },
    } as unknown as ReturnType<typeof useQuery>;
  });

  vi.mocked(useMutation).mockImplementation((mutation, options) => {
    const operationName = getOperationName(mutation);
    mutationCallbacks.set(operationName, {
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
    const mutate =
      operationName === 'updateProduct'
        ? mocks.updateProduct
        : mocks.deleteProduct;
    return [mutate] as unknown as ReturnType<typeof useMutation>;
  });
});

describe('EditProduct', () => {
  it('loads the product for the route id', () => {
    renderEditProduct();

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { productId: 'product-1' },
        fetchPolicy: 'no-cache',
      })
    );
    expect(screen.getByTestId('loaded-product')).toHaveTextContent('product-1');
  });

  it('shows a loading state while the product is fetched', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
    } as unknown as ReturnType<typeof useQuery>);
    renderEditProduct();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit product' })
    ).not.toBeInTheDocument();
  });

  it('does not render the form when no product is returned', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    renderEditProduct();

    expect(
      screen.getByRole('heading', { name: 'Edit product price' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('loaded-product')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Submit product' })
    ).not.toBeInTheDocument();
  });

  it('updates the product and navigates after success', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Submit product' }));

    expect(mocks.updateProduct).toHaveBeenCalledWith({
      variables: { productId: 'product-1', product: productInput },
    });
    act(() => {
      mutationCallbacks.get('updateProduct')?.onCompleted?.({ success: true });
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/products');
  });

  it('navigates back when editing is canceled', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/admin/products');
    expect(mocks.updateProduct).not.toHaveBeenCalled();
  });

  it('opens the delete confirmation and cancels without deleting', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    expect(
      screen.getByRole('dialog', { name: 'Confirm delete' })
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.deleteProduct).not.toHaveBeenCalled();
  });

  it('deletes the product after confirmation and navigates on success', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(mocks.deleteProduct).toHaveBeenCalledWith({
      variables: { productId: 'product-1' },
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => {
      mutationCallbacks.get('deleteProduct')?.onCompleted?.({ success: true });
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/products');
  });

  it('shows and dismisses query errors', async () => {
    const user = renderEditProduct();

    act(() => {
      onQueryError?.(new ApolloError({ errorMessage: 'Product query failed' }));
    });
    await expectErrorToBeDismissible(user, 'Product query failed');
  });

  it('shows and dismisses update errors', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Submit product' }));
    act(() => {
      mutationCallbacks
        .get('updateProduct')
        ?.onError?.(new ApolloError({ errorMessage: 'Product update failed' }));
    });

    await expectErrorToBeDismissible(user, 'Product update failed');
  });

  it('shows and dismisses delete errors without navigating', async () => {
    const user = renderEditProduct();

    await user.click(screen.getByRole('button', { name: 'Request delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    act(() => {
      mutationCallbacks
        .get('deleteProduct')
        ?.onError?.(new ApolloError({ errorMessage: 'Product delete failed' }));
    });

    await expectErrorToBeDismissible(user, 'Product delete failed');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
