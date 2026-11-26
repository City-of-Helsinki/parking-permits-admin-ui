import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PowerType } from '../../types';
import PowerTypeSelect from './PowerTypeSelect';

const bensin: PowerType = { name: 'Bensin', identifier: '01' };

const renderSelect = (powerType?: PowerType, disabled = false) => {
  const onChange = vi.fn();
  render(
    <PowerTypeSelect
      label="Power type"
      powerType={powerType as PowerType}
      disabled={disabled}
      onChange={onChange}
    />
  );
  return { onChange, user: userEvent.setup() };
};

describe('PowerTypeSelect', () => {
  it('lists the translated power types and reports the picked one', async () => {
    const { onChange, user } = renderSelect(bensin);

    await user.click(screen.getByRole('combobox'));

    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['Electric', 'Bensin', 'Diesel', 'Bifuel']);

    await user.click(screen.getByRole('option', { name: 'Diesel' }));

    expect(onChange).toHaveBeenCalledWith({ name: 'Diesel', identifier: '02' });
  });

  it('adds an unknown power type as an "other" option', async () => {
    const { onChange, user } = renderSelect({ name: '', identifier: '99' });

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(5);
    expect(options[4]).toHaveTextContent('Other');

    await user.click(options[0]);

    expect(onChange).toHaveBeenCalledWith({
      name: 'Electric',
      identifier: '04',
    });
  });

  it('defaults to bensin when no power type is given', () => {
    renderSelect(undefined);

    expect(screen.getByRole('combobox')).toHaveTextContent('Bensin');
  });

  it('does not open when disabled', async () => {
    const { user } = renderSelect(bensin, true);

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
