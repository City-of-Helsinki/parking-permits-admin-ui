import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerSearchParams } from '../../../types';
import CustomersSearch from './CustomersSearch';

const emptyParams: CustomerSearchParams = {
  name: '',
  nationalIdNumber: '',
};
const filledParams: CustomerSearchParams = {
  name: 'Jane Doe',
  nationalIdNumber: '010101-123A',
};

const renderSearch = (searchParams = emptyParams) => {
  const onSearch = vi.fn();
  render(<CustomersSearch searchParams={searchParams} onSearch={onSearch} />);
  return { onSearch, user: userEvent.setup() };
};

const searchButton = () => screen.getByRole('button', { name: 'Search' });

describe('CustomersSearch', () => {
  it('initializes the fields from search parameters and submits them', async () => {
    const { onSearch, user } = renderSearch(filledParams);

    expect(screen.getByLabelText('Name')).toHaveValue(filledParams.name);
    expect(screen.getByLabelText('Personal ID')).toHaveValue(
      filledParams.nationalIdNumber
    );
    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith(filledParams);
  });

  it('submits the entered name and personal ID', async () => {
    const { onSearch, user } = renderSearch();

    await user.type(screen.getByLabelText('Name'), filledParams.name);
    await user.type(
      screen.getByLabelText('Personal ID'),
      filledParams.nationalIdNumber
    );
    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith(filledParams);
  });

  it('shows clear only for active filters and resets them', async () => {
    const { onSearch, user } = renderSearch({
      ...filledParams,
      nationalIdNumber: '',
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Personal ID')).toHaveValue('');
    expect(onSearch).not.toHaveBeenCalled();

    await user.click(searchButton());
    expect(onSearch).toHaveBeenCalledWith(emptyParams);
  });
});
