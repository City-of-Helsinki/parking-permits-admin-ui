import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefundSearchParams, RefundStatusOrAll } from '../../../types';
import RefundsSearch from '../RefundsSearch';

vi.mock('../RefundStatusSelect', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (status: RefundStatusOrAll) => void;
  }) => (
    <div>
      <span data-testid="status-value">{value}</span>
      <button onClick={() => onChange('ACCEPTED' as RefundStatusOrAll)}>
        pick status
      </button>
    </div>
  ),
}));

const emptyParams: RefundSearchParams = {
  q: '',
  startDate: '',
  endDate: '',
  status: 'ALL',
  paymentTypes: '',
};

const renderSearch = (searchParams = emptyParams) => {
  const onSearch = vi.fn();
  render(<RefundsSearch searchParams={searchParams} onSearch={onSearch} />);
  return { onSearch, user: userEvent.setup() };
};

const searchButton = () => screen.getByRole('button', { name: 'Search' });

describe('RefundsSearch', () => {
  it('submits the entered filters with ISO dates via the search button', async () => {
    const { onSearch, user } = renderSearch();

    await user.click(screen.getByText('pick status'));
    await user.type(document.getElementById('startDate')!, '1.2.2024');
    await user.type(document.getElementById('endDate')!, '15.3.2024');
    await user.click(screen.getByLabelText('Online payment'));
    await user.click(screen.getByLabelText('Cashier payment'));
    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith({
      q: '',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      status: 'ACCEPTED',
      paymentTypes: 'ONLINE_PAYMENT,CASHIER_PAYMENT',
    });
  });

  it('submits the typed query', async () => {
    const { onSearch, user } = renderSearch();

    await user.type(screen.getByRole('searchbox'), 'abc');
    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith({ ...emptyParams, q: 'abc' });
  });

  it('submits empty params unchanged', async () => {
    const { onSearch, user } = renderSearch();

    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(emptyParams);
  });

  it('initializes status and payment types from the search params', async () => {
    const { onSearch, user } = renderSearch({
      ...emptyParams,
      status: 'REJECTED' as RefundStatusOrAll,
      paymentTypes: 'ONLINE_PAYMENT',
    });

    expect(screen.getByTestId('status-value')).toHaveTextContent('REJECTED');
    expect(screen.getByLabelText('Online payment')).toBeChecked();
    expect(screen.getByLabelText('Cashier payment')).not.toBeChecked();

    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'REJECTED',
        paymentTypes: 'ONLINE_PAYMENT',
      })
    );
  });
});
