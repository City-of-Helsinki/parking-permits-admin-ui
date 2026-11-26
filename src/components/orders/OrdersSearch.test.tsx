import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderSearchParams } from '../../types';
import OrdersSearch from './OrdersSearch';

vi.mock('../common/ZoneSelect', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (zone?: { name: string }) => void;
  }) => (
    <div>
      <span data-testid="zone-value">{value}</span>
      <button onClick={() => onChange({ name: 'A' })}>pick zone</button>
    </div>
  ),
}));

const emptyParams: OrderSearchParams = {
  q: '',
  startDate: '',
  endDate: '',
  parkingZone: '',
  contractTypes: '',
  paymentTypes: '',
  priceDiscounts: '',
};

const renderSearch = (searchParams = emptyParams) => {
  const onSubmit = vi.fn();
  render(<OrdersSearch searchParams={searchParams} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
};

describe('OrdersSearch', () => {
  it('submits the entered filters with ISO dates', async () => {
    const { onSubmit, user } = renderSearch();

    await user.type(screen.getByLabelText('Order created from'), '1.2.2024');
    await user.type(screen.getByLabelText('Order created until'), '15.3.2024');
    await user.click(screen.getByText('pick zone'));
    await user.click(screen.getByLabelText('Open ended'));
    await user.click(screen.getByLabelText('Online payment'));
    await user.click(screen.getByLabelText('Cashier payment'));
    await user.click(screen.getByLabelText('Low emission'));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledWith({
      q: '',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      parkingZone: 'A',
      contractTypes: 'OPEN_ENDED',
      paymentTypes: 'ONLINE_PAYMENT,CASHIER_PAYMENT',
      priceDiscounts: 'LOW_EMISSION',
    });
  });

  it('shows the clear button only with active filters and resets them', async () => {
    const { onSubmit, user } = renderSearch();
    const clearName = { name: 'Clear the search criteria' };

    expect(screen.queryByRole('button', clearName)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Low emission'));
    await user.click(screen.getByRole('button', clearName));
    expect(screen.queryByRole('button', clearName)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledWith(emptyParams);
  });

  it('initializes the filters from the search params', async () => {
    const { onSubmit, user } = renderSearch({
      ...emptyParams,
      q: 'abc',
      parkingZone: 'B',
      contractTypes: 'FIXED_PERIOD,OPEN_ENDED',
    });

    expect(screen.getByRole('searchbox')).toHaveValue('abc');
    expect(screen.getByTestId('zone-value')).toHaveTextContent('B');
    expect(screen.getByLabelText('Fixed period')).toBeChecked();
    expect(screen.getByLabelText('Open ended')).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'abc',
        parkingZone: 'B',
        contractTypes: 'FIXED_PERIOD,OPEN_ENDED',
      })
    );
  });
});
