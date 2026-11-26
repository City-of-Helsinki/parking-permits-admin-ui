import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductUnit } from '../../../types';
import ProductUnitSelect from './ProductUnitSelect';

describe('ProductUnitSelect', () => {
  it('lists product units and reports the selected unit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ProductUnitSelect
        label="Unit"
        value={ProductUnit.PIECES}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('pcs');
    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['p/m', 'pcs']);

    await user.click(screen.getByRole('option', { name: 'p/m' }));

    expect(onChange).toHaveBeenCalledWith(ProductUnit.MONTHLY);
  });

  it('defaults to monthly when no value is provided', () => {
    render(<ProductUnitSelect label="Unit" onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('p/m');
  });
});
