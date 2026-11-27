import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Column } from '../../types';
import TableRow from './TableRow';
import type { TableRowProps } from './TableRow';

interface Row {
  id: string;
  name: string;
  count: number;
}

const row: Row = {
  id: 'row-1',
  name: 'Jane Doe',
  count: 2,
};

const columns: Column<Row>[] = [
  {
    name: 'Name',
    field: 'name',
    selector: item => item.name,
    sortable: false,
  },
  {
    name: 'Count',
    field: 'count',
    selector: item => item.count,
    sortable: false,
  },
];

const renderRow = (props: Partial<TableRowProps<Row>> = {}) => {
  const callbacks = {
    onClick: vi.fn(),
    onSelectionChange: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <table>
      <tbody>
        <TableRow
          rowId={row.id}
          columns={columns}
          row={row}
          {...callbacks}
          {...props}
        />
      </tbody>
    </table>
  );

  return { ...callbacks, user };
};

describe('TableRow', () => {
  it('renders column values and reports row clicks', async () => {
    const { onClick, user } = renderRow();

    expect(screen.getByRole('cell', { name: 'Jane Doe' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '2' })).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('row', { name: /Jane Doe/ }));
    expect(onClick).toHaveBeenCalledWith(row);
  });

  it.each([
    { selected: false, nextSelected: true },
    { selected: true, nextSelected: false },
  ])(
    'toggles selection from $selected to $nextSelected without triggering row click',
    async ({ selected, nextSelected }) => {
      const { onClick, onSelectionChange, user } = renderRow({ selected });
      const checkbox = screen.getByRole('checkbox', { name: 'Jane Doe' });

      expect(checkbox).toHaveProperty('checked', selected);
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith(nextSelected);
      expect(onClick).not.toHaveBeenCalled();
    }
  );

  it('renders the first cell without a checkbox when checkbox display is disabled', () => {
    renderRow({ selected: false, showCheckbox: false });

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Jane Doe' })).toBeVisible();
  });
});
