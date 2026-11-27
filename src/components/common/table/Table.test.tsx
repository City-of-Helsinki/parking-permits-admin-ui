import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderDirection } from '../../types';
import type { Column } from '../../types';
import Table from './Table';
import type { TableProps } from './Table';

interface Row {
  id: string;
  name: string;
  count: number;
}

const firstRow: Row = { id: 'row-1', name: 'First row', count: 1 };
const secondRow: Row = { id: 'row-2', name: 'Second row', count: 2 };
const rows = [firstRow, secondRow];

const columns: Column<Row>[] = [
  {
    name: 'Name',
    field: 'name',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Count',
    field: 'count',
    selector: row => row.count,
    sortable: false,
  },
];

const renderTable = (overrides: Partial<TableProps<Row>> = {}) => {
  const callbacks = {
    onOrderBy: vi.fn(),
    onRowClick: vi.fn(),
    onSelectionChange: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <Table<Row>
      columns={columns}
      data={rows}
      loading={false}
      rowIdSelector={row => row.id}
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('Table', () => {
  it('renders column headers and row values', () => {
    renderTable();

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Count' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'First row' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '1' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Second row' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '2' })).toBeVisible();
  });

  it.each([
    { data: undefined, message: 'Enter the search criteria' },
    { data: [], message: 'No results.' },
  ])('shows "$message" when rows are $data', ({ data, message }) => {
    renderTable({ data });

    expect(screen.getByText(message)).toBeVisible();
  });

  it('hides rows while loading', () => {
    renderTable({ loading: true });

    expect(
      screen.queryByRole('cell', { name: 'First row' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No results.')).not.toBeInTheDocument();
  });

  it('forwards sorting and row-click actions', async () => {
    const { onOrderBy, onRowClick, user } = renderTable({
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

    await user.click(screen.getByRole('row', { name: /First row/ }));
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it.each([
    {
      selection: [],
      wasSelected: false,
      expectedSelection: [firstRow],
    },
    {
      selection: [firstRow],
      wasSelected: true,
      expectedSelection: [],
    },
  ])(
    'updates selection when a row checkbox is clicked',
    async ({ selection, wasSelected, expectedSelection }) => {
      const { onRowClick, onSelectionChange, user } = renderTable({
        selection,
      });
      const checkbox = screen.getByRole('checkbox', { name: 'First row' });

      expect(checkbox).toHaveProperty('checked', wasSelected);
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith(expectedSelection);
      expect(onRowClick).not.toHaveBeenCalled();
    }
  );

  it('renders cell values without checkboxes when checkbox display is disabled', () => {
    renderTable({ selection: [], showCheckbox: false });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'First row' })).toBeVisible();
  });
});
