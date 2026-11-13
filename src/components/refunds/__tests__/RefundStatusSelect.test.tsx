import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefundStatus } from '../../../types';
import RefundStatusSelect from '../RefundStatusSelect';

const renderSelect = (
  value?: React.ComponentProps<typeof RefundStatusSelect>['value']
) => {
  const onChange = vi.fn();
  render(<RefundStatusSelect value={value} onChange={onChange} />);
  return { onChange, user: userEvent.setup() };
};

describe('RefundStatusSelect', () => {
  it('lists all statuses and reports the picked one', async () => {
    const { onChange, user } = renderSelect('ALL');

    await user.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map(option => option.textContent)
    ).toEqual(
      ['all', 'open', 'requestForApproval', 'accepted', 'rejected'].map(
        name => `refundStatus.${name}`
      )
    );

    await user.click(screen.getByRole('option', { name: 'refundStatus.open' }));

    expect(onChange).toHaveBeenCalledWith(RefundStatus.OPEN);
  });

  it('defaults to "all" when no value is given', () => {
    renderSelect(undefined);

    expect(screen.getByRole('combobox')).toHaveTextContent('refundStatus.all');
  });
});
