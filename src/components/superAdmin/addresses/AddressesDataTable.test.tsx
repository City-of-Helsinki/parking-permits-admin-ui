import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDirection } from '../../types';
import type { Address, PageInfo } from '../../../types';
import AddressesDataTable from './AddressesDataTable';
import type { AddressesDataTableProps } from './AddressesDataTable';

const address: Address = {
  id: 'address-1',
  streetName: 'Test Street',
  streetNameSv: 'Testgatan',
  streetNumber: '10',
  postalCode: '00100',
  city: 'Helsinki',
  citySv: 'Helsingfors',
  zone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
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

const renderTable = (overrides: Partial<AddressesDataTableProps> = {}) => {
  const callbacks = {
    onOrderBy: vi.fn(),
    onPage: vi.fn(),
    onRowClick: vi.fn(),
    onExport: vi.fn(),
  };

  render(
    <AddressesDataTable
      addresses={[address]}
      loading={false}
      pageInfo={pageInfo}
      {...callbacks}
      {...overrides}
    />
  );

  return callbacks;
};

describe('AddressesDataTable', () => {
  it('renders address details', () => {
    renderTable();

    expect(
      screen.getByRole('columnheader', { name: 'Street name' })
    ).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Test Street' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Testgatan' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '10' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '00100' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Helsinki' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Helsingfors' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'A' })).toBeVisible();
  });

  it('forwards sorting, pagination, row click, and export actions', async () => {
    const user = userEvent.setup();
    const callbacks = renderTable({
      orderBy: {
        orderField: 'streetName',
        orderDirection: OrderDirection.ASC,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Street name' }));
    expect(callbacks.onOrderBy).toHaveBeenCalledWith({
      orderField: 'streetName',
      orderDirection: OrderDirection.DESC,
    });

    await user.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(callbacks.onPage).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('row', { name: /Test Street/ }));
    expect(callbacks.onRowClick).toHaveBeenCalledWith(address);

    await user.click(
      screen.getByRole('button', { name: 'Download the results as a csv file' })
    );
    expect(callbacks.onExport).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state instead of address rows', () => {
    renderTable({ loading: true });

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Test Street' })
    ).not.toBeInTheDocument();
  });
});
