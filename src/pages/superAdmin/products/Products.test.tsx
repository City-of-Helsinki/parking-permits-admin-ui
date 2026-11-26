import { ApolloError } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType, ReactNode } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { OrderDirection } from '../../../components/types';
import { ProductType, ProductUnit } from '../../../types';
import type { Product, ProductsQueryData } from '../../../types';
import Products from './Products';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  exportData: vi.fn(),
  formatExportUrl: vi.fn(() => 'formatted-export-url'),
  refetch: vi.fn(),
}));

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: mocks.useQuery,
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
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

vi.mock('../../../auth/makePrivate', () => ({
  default: (Component: ComponentType) => Component,
}));

vi.mock('../../../components/superAdmin/products/ProductsDataTable', () => ({
  default: ({
    products,
    onPage,
    onOrderBy,
    onRowClick,
    onExport,
  }: {
    products: Product[];
    onPage?: (page: number) => void;
    onOrderBy: (orderBy: {
      orderField: string;
      orderDirection: string;
    }) => void;
    onRowClick?: (product: Product) => void;
    onExport?: () => void;
  }) => (
    <div data-testid="products-table">
      <div data-testid="product-ids">
        {products.map(product => product.id).join(',')}
      </div>
      <button onClick={() => onPage?.(3)}>Go to page 3</button>
      <button
        onClick={() =>
          onOrderBy({ orderField: 'unitPrice', orderDirection: 'DESC' })
        }>
        Sort by price
      </button>
      {products[0] && (
        <button onClick={() => onRowClick?.(products[0])}>Open product</button>
      )}
      <button onClick={onExport}>Export products</button>
    </div>
  ),
}));

vi.mock('../../../export/useExportData', () => ({
  default: () => mocks.exportData,
}));

vi.mock('../../../export/utils', () => ({
  formatExportUrl: mocks.formatExportUrl,
}));

const product: Product = {
  id: 'product-1',
  type: ProductType.RESIDENT,
  zone: 'A',
  unitPrice: 10,
  unit: ProductUnit.MONTHLY,
  startDate: '2030-01-01',
  endDate: '2030-12-31',
  vat: 2.4,
  vatPercentage: 24,
  lowEmissionDiscount: 0,
  lowEmissionDiscountPercentage: 0,
  secondaryVehicleIncreaseRate: 25,
  modifiedAt: '2030-01-01T00:00:00.000Z',
  modifiedBy: 'Admin',
};

const productsData: ProductsQueryData = {
  products: {
    objects: [product],
    pageInfo: {
      numPages: 1,
      page: 1,
      prev: null,
      next: null,
      startIndex: 0,
      endIndex: 1,
      count: 1,
    },
  },
};

const setupQueryResult = (
  overrides: { loading?: boolean; data?: ProductsQueryData } = {}
) => {
  mocks.useQuery.mockReturnValue({
    loading: false,
    data: productsData,
    refetch: mocks.refetch,
    ...overrides,
  });
};

const CurrentLocation = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  return (
    <output data-testid="current-location">
      {pathname}
      {search}
      {navigationType}
    </output>
  );
};

const renderProducts = (initialEntry = '/products') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/products/*" element={<Products />} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>
  );
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  setupQueryResult();
});

describe('Products', () => {
  it('shows a loading state while products are fetched', () => {
    setupQueryResult({ loading: true, data: undefined });
    renderProducts();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
  });

  it('shows a no-data message when the query returns no data', () => {
    setupQueryResult({ data: undefined });
    renderProducts();

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('uses the query parameters and renders products', () => {
    renderProducts(
      '/products?page=4&orderField=modifiedAt&orderDirection=DESC'
    );

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          pageInput: { page: 4 },
          orderBy: {
            orderField: 'modifiedAt',
            orderDirection: OrderDirection.DESC,
          },
        },
      })
    );
    expect(screen.getByTestId('product-ids')).toHaveTextContent('product-1');
  });

  it('navigates to the create page', async () => {
    const user = renderProducts();

    await user.click(screen.getByRole('button', { name: 'Add new price' }));
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/products/create'
    );
  });

  it('navigates to the product detail page when a row is clicked', async () => {
    const user = renderProducts();

    await user.click(screen.getByRole('button', { name: 'Open product' }));
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/products/product-1'
    );
  });

  it('refetches for page and order changes and replaces query parameters', async () => {
    const user = renderProducts(
      '/products?page=2&orderField=zone&orderDirection=ASC'
    );

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(1, {
      pageInput: { page: 3 },
      orderBy: { orderField: 'zone', orderDirection: OrderDirection.ASC },
    });
    expect(screen.getByTestId('current-location')).toHaveTextContent('page=3');

    await user.click(screen.getByRole('button', { name: 'Sort by price' }));
    expect(mocks.refetch).toHaveBeenNthCalledWith(2, {
      pageInput: { page: 3 },
      orderBy: { orderField: 'unitPrice', orderDirection: OrderDirection.DESC },
    });
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      'orderField=unitPrice'
    );
    expect(screen.getByTestId('current-location')).toHaveTextContent('REPLACE');
  });

  it('exports the current product list', async () => {
    const user = renderProducts(
      '/products?page=2&orderField=modifiedAt&orderDirection=DESC'
    );

    await user.click(screen.getByRole('button', { name: 'Export products' }));

    expect(mocks.formatExportUrl).toHaveBeenCalledWith('products', {
      orderField: 'modifiedAt',
      orderDirection: OrderDirection.DESC,
      page: '2',
    });
    expect(mocks.exportData).toHaveBeenCalledWith('formatted-export-url');
  });

  it('shows and dismisses query errors', async () => {
    const user = renderProducts();
    const queryOptions = mocks.useQuery.mock.calls[0][1] as {
      onError: (error: ApolloError) => void;
    };

    act(() => {
      queryOptions.onError(new ApolloError({ errorMessage: 'Request failed' }));
    });
    expect(screen.getByText('Request failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Request failed')).not.toBeInTheDocument();
  });
});
