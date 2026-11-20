import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleClass } from '../../../types';
import VehicleClassSelect from '../VehicleClassSelect';

const renderSelect = (disabled = false) => {
  const onChange = vi.fn();
  render(
    <VehicleClassSelect
      label="Vehicle class"
      value={VehicleClass.M1}
      disabled={disabled}
      onChange={onChange}
    />
  );
  return { onChange, user: userEvent.setup() };
};

describe('VehicleClassSelect', () => {
  it('lists every vehicle class and reports the picked one', async () => {
    const { onChange, user } = renderSelect();

    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(Object.values(VehicleClass));

    await user.click(screen.getByRole('option', { name: VehicleClass.N1 }));

    expect(onChange).toHaveBeenCalledWith(VehicleClass.N1);
  });

  it('does not open when disabled', async () => {
    const { user } = renderSelect(true);

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
