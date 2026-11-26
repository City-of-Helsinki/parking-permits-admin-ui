import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductType } from '../../../types';
import ProductTypeSelect from './ProductTypeSelect';

describe('ProductTypeSelect', () => {
  it('lists product types and reports the selected type', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ProductTypeSelect
        label="Product type"
        value={ProductType.COMPANY}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Company parking');
    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['Resident parking', 'Company parking']);

    await user.click(screen.getByRole('option', { name: 'Resident parking' }));

    expect(onChange).toHaveBeenCalledWith(ProductType.RESIDENT);
  });

  it('defaults to resident parking when no value is provided', () => {
    render(<ProductTypeSelect label="Product type" onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent('Resident parking');
  });
});
