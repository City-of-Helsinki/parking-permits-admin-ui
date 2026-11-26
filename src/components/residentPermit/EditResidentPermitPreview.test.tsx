import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitContractType, RefundAccountOption } from '../../types';
import type { PermitDetail, PermitPriceChange } from '../../types';
import { getEmptyPermit } from './consts';
import EditResidentPermitPreview from './EditResidentPermitPreview';

const permit: PermitDetail = {
  ...getEmptyPermit(),
  contractType: PermitContractType.OPEN_ENDED,
};

const priceChangeList: PermitPriceChange[] = [
  {
    product: 'Resident parking',
    previousPrice: 10,
    newPrice: 12,
    priceChange: 2,
    priceChangeVat: 0.4,
    startDate: '2030-01-01',
    endDate: '2030-12-31',
    monthCount: 12,
  },
];

vi.mock('../permitDetail/VehicleInfo', () => ({
  default: () => <div data-testid="vehicle-info">Vehicle details</div>,
}));

vi.mock('../permitDetail/CustomerInfo', () => ({
  default: () => <div data-testid="customer-info">Customer details</div>,
}));

vi.mock('../permitDetail/PermitInfo', () => ({
  default: () => <div data-testid="permit-info">Permit details</div>,
}));

vi.mock('../permitDetail/PermitPriceChangeInfo', () => ({
  default: ({
    priceChangeList: changes,
    refundAccountNumber,
    refundAccountOption,
    onChangeRefundAccountNumber,
    onChangeRefundAccountOption,
  }: {
    priceChangeList: PermitPriceChange[];
    refundAccountNumber: string;
    refundAccountOption: RefundAccountOption;
    onChangeRefundAccountNumber: (accountNumber: string) => void;
    onChangeRefundAccountOption: (option: RefundAccountOption) => void;
  }) => (
    <div data-testid="price-change-info">
      <div data-testid="price-change-count">{changes.length}</div>
      <div data-testid="refund-account-number">{refundAccountNumber}</div>
      <div data-testid="refund-account-option">{refundAccountOption}</div>
      <button
        onClick={() =>
          onChangeRefundAccountOption(RefundAccountOption.UNKNOWN)
        }>
        Use unknown account
      </button>
      <button
        onClick={() => onChangeRefundAccountNumber('FI111111111111111111')}>
        Change account number
      </button>
    </div>
  ),
}));

const renderPreview = (
  overrides: {
    permit?: PermitDetail;
    priceChangeList?: PermitPriceChange[];
  } = {}
) => {
  const callbacks = {
    onChangeRefundAccountNumber: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <EditResidentPermitPreview
      permit={permit}
      priceChangeList={[]}
      refundAccountNumber="FI0000000000000000"
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('EditResidentPermitPreview', () => {
  it('shows renewal pricing for an open-ended permit without price changes', async () => {
    const { onCancel, onConfirm, user } = renderPreview();

    expect(screen.getByText('Summary')).toBeVisible();
    expect(screen.getByTestId('vehicle-info')).toBeInTheDocument();
    expect(screen.getByTestId('customer-info')).toBeInTheDocument();
    expect(screen.getByTestId('permit-info')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The price for the next subscription period is calculated automatically using the updated permit details.'
      )
    ).toBeVisible();
    expect(screen.queryByTestId('price-change-info')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go back' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows price changes and updates the refund account option', async () => {
    const { user, ...callbacks } = renderPreview({
      permit: { ...permit, contractType: PermitContractType.FIXED_PERIOD },
      priceChangeList,
    });

    expect(screen.getByTestId('price-change-count')).toHaveTextContent('1');
    expect(screen.getByTestId('refund-account-number')).toHaveTextContent(
      'FI0000000000000000'
    );
    expect(screen.getByTestId('refund-account-option')).toHaveTextContent(
      RefundAccountOption.KNOWN
    );

    await user.click(
      screen.getByRole('button', { name: 'Use unknown account' })
    );
    expect(screen.getByTestId('refund-account-option')).toHaveTextContent(
      RefundAccountOption.UNKNOWN
    );

    await user.click(
      screen.getByRole('button', { name: 'Change account number' })
    );
    expect(callbacks.onChangeRefundAccountNumber).toHaveBeenCalledWith(
      'FI111111111111111111'
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(callbacks.onConfirm).toHaveBeenCalledTimes(1);
  });
});
