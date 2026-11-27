import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefundAccountOption } from '../../types';
import type { PermitPriceChange } from '../../types';
import PermitPriceChangeInfo from './PermitPriceChangeInfo';
import type { PermitPriceChangeInfoProps } from './PermitPriceChangeInfo';

const priceChange: PermitPriceChange = {
  product: 'Resident permit',
  previousPrice: 10,
  newPrice: 12,
  priceChange: 2,
  priceChangeVat: 0.4,
  startDate: '2030-01-01T12:00:00',
  endDate: '2030-01-31T12:00:00',
  monthCount: 2,
};

const refundPriceChange: PermitPriceChange = {
  ...priceChange,
  previousPrice: 12,
  newPrice: 10,
  priceChange: -2,
  priceChangeVat: -0.4,
};

const renderPriceChangeInfo = (
  overrides: Partial<PermitPriceChangeInfoProps> = {}
) => {
  const callbacks = {
    onChangeRefundAccountNumber: vi.fn(),
    onChangeRefundAccountOption: vi.fn(),
  };

  render(
    <PermitPriceChangeInfo
      priceChangeList={[priceChange]}
      refundAccountNumber="FI00"
      refundAccountOption={RefundAccountOption.KNOWN}
      {...callbacks}
      {...overrides}
    />
  );

  return callbacks;
};

const getIbanInput = () => screen.getByRole('textbox', { name: /^IBAN/ });

describe('PermitPriceChangeInfo', () => {
  it('shows item details and totals for a higher price', () => {
    renderPriceChangeInfo();

    expect(screen.getByText('New order')).toBeVisible();
    expect(screen.getByText('Resident permit')).toBeVisible();
    expect(screen.getByText('12.00 €/pm')).toBeVisible();
    expect(screen.getByText('1.1.2030 - 31.1.2030')).toBeVisible();
    expect(screen.getByText('2 months total (incl. vat)')).toBeVisible();
    expect(screen.getAllByText('24.00 €')).toHaveLength(2);
    expect(screen.getByText('-20.00 €')).toBeVisible();
    expect(screen.getByText('Price difference')).toBeVisible();
    expect(screen.getAllByText('4.00 €')).toHaveLength(2);
    expect(screen.getByText('Total additional payment')).toBeVisible();
    expect(screen.getByText('0.80 €')).toBeVisible();
    expect(screen.queryByLabelText('IBAN')).not.toBeInTheDocument();
  });

  it('shows refund details and handles known and unknown account options', async () => {
    const user = userEvent.setup();
    const { onChangeRefundAccountNumber, onChangeRefundAccountOption } =
      renderPriceChangeInfo({ priceChangeList: [refundPriceChange] });

    expect(screen.getByText('Total amount to be refunded')).toBeVisible();
    expect(screen.getByText('4.00 €')).toBeVisible();
    expect(getIbanInput()).toHaveValue('FI00');
    expect(
      screen.getByText('IBAN-number is not in valid format')
    ).toBeVisible();
    expect(
      screen.getByLabelText("Customer's IBAN-number for refund")
    ).toBeChecked();

    await user.click(screen.getByLabelText("Customer's IBAN-number unknown"));

    expect(onChangeRefundAccountOption).toHaveBeenCalledWith(
      RefundAccountOption.UNKNOWN
    );
    expect(onChangeRefundAccountNumber).toHaveBeenCalledWith('');
  });

  it('hides refund fields when the account option is unknown', () => {
    renderPriceChangeInfo({
      priceChangeList: [refundPriceChange],
      refundAccountOption: RefundAccountOption.UNKNOWN,
    });

    expect(getIbanInput()).toBeDisabled();
    expect(
      screen.getByLabelText("Customer's IBAN-number unknown")
    ).toBeChecked();
    expect(
      screen.queryByText('IBAN-number is not in valid format')
    ).not.toBeInTheDocument();
  });

  it('does not show additional payment or refund sections when there is no price change', () => {
    renderPriceChangeInfo({
      priceChangeList: [{ ...priceChange, priceChange: 0, priceChangeVat: 0 }],
    });

    expect(
      screen.queryByText('Total additional payment')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Total amount to be refunded')
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('IBAN')).not.toBeInTheDocument();
  });
});
