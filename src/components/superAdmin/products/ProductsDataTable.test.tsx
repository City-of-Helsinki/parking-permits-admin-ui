import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDirection } from '../../types';
import type { PageInfo, Product } from '../../../types';
import { ProductType, ProductUnit } from '../../../types';
import ProductsDataTable from './ProductsDataTable';
import type { ProductsDataTableProps } from './ProductsDataTable';

const product: Product = {
  id: 'product-1',
  type: ProductType.COMPANY,
  zone: 'A',
  unitPrice: 12.5,
  unit: ProductUnit.MONTHLY,
  startDate: '2030-01-01T12:00:00',
  endDate: '2030-12-31T12:00:00',
  vat: 3,
  vatPercentage: 24,
  lowEmissionDiscount: 6.25,
  lowEmissionDiscountPercentage: 50,
  secondaryVehicleIncreaseRate: 25,
  modifiedAt: '2030-01-15T10:30:00',
  modifiedBy: '',
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

const renderTable = (overrides: Partial<ProductsDataTableProps> = {}) => {
  const callbacks = {
    onOrderBy: vi.fn(),
    onPage: vi.fn(),
    onRowClick: vi.fn(),
    onExport: vi.fn(),
  };

  render(
    <ProductsDataTable
      products={[product]}
      loading={false}
      pageInfo={pageInfo}
      {...callbacks}
      {...overrides}
    />
  );

  return callbacks;
};

describe('ProductsDataTable', () => {
  it('renders formatted product details', () => {
    renderTable();

    expect(
      screen.getByRole('columnheader', { name: 'Product type' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Company parking' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'A' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '12.50 €/pm' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '24%' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '50%' })).toBeVisible();
    expect(
      screen.getByRole('cell', { name: '1.1.2030 - 31.12.2030' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: '15.1.2030 10:30' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '-' })).toBeVisible();
  });

  it('forwards sorting, pagination, row click, and export actions', async () => {
    const user = userEvent.setup();
    const callbacks = renderTable({
      orderBy: {
        orderField: 'price',
        orderDirection: OrderDirection.ASC,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Price' }));
    expect(callbacks.onOrderBy).toHaveBeenCalledWith({
      orderField: 'price',
      orderDirection: OrderDirection.DESC,
    });

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(callbacks.onPage).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('row', { name: /Company parking/ }));
    expect(callbacks.onRowClick).toHaveBeenCalledWith(product);

    await user.click(
      screen.getByRole('button', { name: 'Download the results as a csv file' })
    );
    expect(callbacks.onExport).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state instead of product rows', () => {
    renderTable({ loading: true });

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Company parking' })
    ).not.toBeInTheDocument();
  });
});
