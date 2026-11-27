import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParkingPermitStatus } from '../../types';
import StatusSelect from './StatusSelect';

const statusLabels = [
  'Draft',
  'Preliminary',
  'Valid',
  'Payment in progress',
  'Cancelled',
  'Closed',
];

const renderStatusSelect = (
  value: React.ComponentProps<typeof StatusSelect>['value'] = 'ALL',
  showAllOption = true
) => {
  const onChange = vi.fn();
  render(
    <StatusSelect
      value={value}
      onChange={onChange}
      showAllOption={showAllOption}
    />
  );
  return { onChange, user: userEvent.setup() };
};

describe('StatusSelect', () => {
  it('lists all permit statuses and reports the selected status', async () => {
    const { onChange, user } = renderStatusSelect();

    expect(screen.getByRole('combobox')).toHaveTextContent('All');
    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(['All', ...statusLabels]);

    await user.click(screen.getByRole('option', { name: 'Preliminary' }));

    expect(onChange).toHaveBeenCalledWith(ParkingPermitStatus.PRELIMINARY);
  });

  it('omits the all option when showAllOption is false', async () => {
    const { user } = renderStatusSelect(ParkingPermitStatus.VALID, false);

    expect(screen.getByRole('combobox')).toHaveTextContent('Valid');
    await user.click(screen.getByRole('combobox'));

    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(statusLabels);
  });
});
