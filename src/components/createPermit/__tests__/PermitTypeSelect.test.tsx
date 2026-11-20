import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitType } from '../../../types';
import PermitTypeSelect from '../PermitTypeSelect';

const T_PATH = 'components.createPermit.permitTypeSelect';

describe('PermitTypeSelect', () => {
  it('lists the permit types and reports the picked one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PermitTypeSelect value={PermitType.RESIDENT} onChange={onChange} />
    );

    expect(screen.getByRole('combobox')).toHaveTextContent(
      `${T_PATH}.residentPermit`
    );
    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual([`${T_PATH}.residentPermit`, `${T_PATH}.companyPermit`]);

    await user.click(
      screen.getByRole('option', { name: `${T_PATH}.companyPermit` })
    );

    expect(onChange).toHaveBeenCalledWith(PermitType.COMPANY);
  });
});
