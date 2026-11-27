import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { PermitDetail } from '../../types';
import { getEmptyPermit } from '../residentPermit/consts';
import RefundInfo from './RefundInfo';

const permit: PermitDetail = {
  ...getEmptyPermit(),
  canBeRefunded: true,
  totalRefundAmount: 12.5,
};

const renderRefundInfo = (currentPermit = permit, iban = '') => {
  const onChangeIban = vi.fn();
  const user = userEvent.setup();
  const ControlledRefundInfo = () => {
    const [currentIban, setCurrentIban] = useState(iban);
    return (
      <RefundInfo
        permit={currentPermit}
        iban={currentIban}
        onChangeIban={value => {
          onChangeIban(value);
          setCurrentIban(value);
        }}
      />
    );
  };
  render(<ControlledRefundInfo />);
  return { onChangeIban, user };
};

describe('RefundInfo', () => {
  it('shows a review notice when the refund amount has not been calculated', () => {
    renderRefundInfo({ ...permit, totalRefundAmount: null });

    expect(
      screen.getByText(
        'Reconcile the previous refund for this permit before ending it.'
      )
    ).toBeVisible();
    expect(screen.queryByText('Refund')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders the remaining amount, refund amount, and description', () => {
    renderRefundInfo();

    expect(screen.getByText('Paid order remaining')).toBeInTheDocument();
    expect(screen.getAllByText('12.50 €')).toHaveLength(2);
    expect(
      screen.getByText(
        '* The price only accounts for remaining full months of the order'
      )
    ).toBeInTheDocument();
  });

  it('shows invalid IBAN errors and formats changed values', async () => {
    const { onChangeIban, user } = renderRefundInfo(permit, 'FI00');

    expect(
      screen.getByText('IBAN-number is not in valid format')
    ).toBeVisible();
    const input = screen.getByRole('textbox', {
      name: /IBAN-number for refund/,
    });
    await user.clear(input);
    onChangeIban.mockClear();
    await user.type(input, 'FI0600000000000000');

    expect(onChangeIban).toHaveBeenLastCalledWith('FI06 0000 0000 0000 00');
    expect(input).toHaveValue('FI06 0000 0000 0000 00');
  });

  it('shows a success message for a valid IBAN', () => {
    renderRefundInfo(permit, 'FI06 0000 0000 0000 00');

    expect(screen.getByText('IBAN checked and valid')).toBeVisible();
  });

  it.each([
    { permit: { ...permit, totalRefundAmount: 0 } },
    { permit: { ...permit, canBeRefunded: false } },
  ])(
    'omits the IBAN input when a refund is unavailable',
    ({ permit: currentPermit }) => {
      renderRefundInfo(currentPermit);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    }
  );
});
