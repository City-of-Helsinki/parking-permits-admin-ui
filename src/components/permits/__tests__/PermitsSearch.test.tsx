import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParkingPermitStatus, PermitSearchParams } from '../../../types';
import PermitsSearch from '../PermitsSearch';

const initialParams: PermitSearchParams = { status: 'ALL', q: '' };

const renderSearch = () => {
  const onSearch = vi.fn();
  render(<PermitsSearch searchParams={initialParams} onSearch={onSearch} />);
  return { onSearch, user: userEvent.setup() };
};

describe('PermitsSearch', () => {
  it('searches with the selected status', async () => {
    const { onSearch, user } = renderSearch();

    await user.click(screen.getByRole('combobox'));
    await user.click(
      screen.getByRole('option', { name: 'permitStatus.valid' })
    );
    await user.click(screen.getByRole('button', { name: /searchButton/ }));

    expect(onSearch).toHaveBeenCalledWith({
      status: ParkingPermitStatus.VALID,
      q: '',
    });
  });

  it('searches with the typed query', async () => {
    const { onSearch, user } = renderSearch();

    await user.type(screen.getByRole('searchbox'), 'abc');
    await user.click(screen.getByRole('button', { name: /searchButton/ }));

    expect(onSearch).toHaveBeenCalledWith({ status: 'ALL', q: 'abc' });
  });
});
