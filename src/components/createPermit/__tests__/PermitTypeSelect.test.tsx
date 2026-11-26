import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitType } from '../../../types';
import PermitTypeSelect from '../PermitTypeSelect';

describe('PermitTypeSelect', () => {
  it('lists the permit types and reports the picked one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PermitTypeSelect value={PermitType.RESIDENT} onChange={onChange} />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Resident permit');
    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['Resident permit', 'Company permit']);

    await user.click(screen.getByRole('option', { name: 'Company permit' }));

    expect(onChange).toHaveBeenCalledWith(PermitType.COMPANY);
  });
});
