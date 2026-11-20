import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SingleSelect from '../SingleSelect';

const options = [
  { label: 'Aaa', value: 'a' },
  { label: 'Bbb', value: 'b' },
];

describe('SingleSelect', () => {
  it('reports the clicked option value and shows an error text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SingleSelect
        label="Pick"
        options={options}
        value="a"
        error="Bad pick"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Bad pick')).toBeVisible();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Bbb' }));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});
