import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LowEmissionDiscountSelect from '../LowEmissionDiscountSelect';

const T_PATH = 'components.superAdmin.products.lowEmissionDiscountSelect';
const HALF_DISCOUNT = 0.5;

const renderSelect = (value?: number) => {
  const onChange = vi.fn();
  render(
    <LowEmissionDiscountSelect
      label="Discount"
      value={value}
      onChange={onChange}
    />
  );
  return { onChange, user: userEvent.setup() };
};

describe('LowEmissionDiscountSelect', () => {
  it('reports the picked discount as a number', async () => {
    const { onChange, user } = renderSelect(HALF_DISCOUNT);

    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['50%', `${T_PATH}.noDiscount`]);

    await user.click(
      screen.getByRole('option', { name: `${T_PATH}.noDiscount` })
    );

    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('falls back to the first option for a missing or unknown value', () => {
    renderSelect(undefined);
    expect(screen.getByRole('combobox')).toHaveTextContent('50%');
  });
});
