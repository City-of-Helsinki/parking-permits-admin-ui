import { useQuery } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AddressSearchParams } from '../../../types';
import AddressesSearch from './AddressesSearch';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useQuery: vi.fn(),
}));

const emptyParams: AddressSearchParams = {
  streetName: '',
  streetNumber: '',
  postalCode: '',
  parkingZone: '',
};

const filledParams: AddressSearchParams = {
  streetName: 'Main Street',
  streetNumber: '12',
  postalCode: '00100',
  parkingZone: 'B',
};

const renderSearch = (searchParams = emptyParams) => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  render(<AddressesSearch searchParams={searchParams} onSearch={onSearch} />);
  return { onSearch, user };
};

const searchButton = () => screen.getByRole('button', { name: 'Search' });
const clearButton = () =>
  screen.getByRole('button', { name: 'Clear the search criteria' });

describe('AddressesSearch', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        zones: [
          { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
          { name: 'B', label: 'Zone B', labelSv: 'Zon B' },
        ],
      },
    } as unknown as ReturnType<typeof useQuery>);
  });

  it('initializes all fields from search parameters and submits them', async () => {
    const { onSearch, user } = renderSearch(filledParams);

    expect(screen.getByLabelText('Street name')).toHaveValue(
      filledParams.streetName
    );
    expect(screen.getByLabelText('Street number')).toHaveValue(
      filledParams.streetNumber
    );
    expect(screen.getByLabelText('Postal code')).toHaveValue(
      filledParams.postalCode
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Zone B');

    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith(filledParams);
  });

  it('submits entered criteria including the selected zone', async () => {
    const { onSearch, user } = renderSearch();

    expect(
      screen.queryByRole('button', { name: 'Clear the search criteria' })
    ).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Street name'), 'Main Street');
    await user.type(screen.getByLabelText('Street number'), '12');
    await user.type(screen.getByLabelText('Postal code'), '00100');
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Zone B' }));
    expect(clearButton()).toBeVisible();
    await user.click(searchButton());

    expect(onSearch).toHaveBeenCalledWith(filledParams);
  });

  it('shows clear only for active filters and resets them without searching', async () => {
    const { onSearch, user } = renderSearch(filledParams);

    await user.click(clearButton());

    expect(screen.getByLabelText('Street name')).toHaveValue('');
    expect(screen.getByLabelText('Street number')).toHaveValue('');
    expect(screen.getByLabelText('Postal code')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveTextContent('Select...');
    expect(
      screen.queryByRole('button', { name: 'Clear the search criteria' })
    ).not.toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();

    await user.click(searchButton());
    expect(onSearch).toHaveBeenCalledWith(emptyParams);
  });
});
