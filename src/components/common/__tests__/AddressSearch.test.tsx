import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressSearch from '../AddressSearch';

const QUERY = gql`
  query AddressSearch($searchInput: String!) {
    addressSearch(searchInput: $searchInput) {
      streetName
      streetNameSv
      streetNumber
      city
      citySv
      postalCode
      location
      zone {
        name
        label
        labelSv
      }
    }
  }
`;

const makeAddress = (streetName: string) => ({
  __typename: 'AddressNode',
  streetName,
  streetNameSv: `${streetName}sv`,
  streetNumber: 1,
  city: 'Testcity',
  citySv: 'Testcitysv',
  postalCode: '00000',
  location: [0, 0],
  zone: {
    __typename: 'ParkingZoneNode',
    name: 'A',
    label: 'A',
    labelSv: 'A',
  },
});

// The search input fires with varying text, so match any variables
const successMock = (
  addresses: ReturnType<typeof makeAddress>[]
): MockedResponse => ({
  request: { query: QUERY },
  variableMatcher: () => true,
  result: { data: { addressSearch: addresses } },
});

const renderSearch = (mocks: MockedResponse[]) => {
  const onSelect = vi.fn();
  render(
    <MockedProvider mocks={mocks}>
      <AddressSearch label="Address" onSelect={onSelect} />
    </MockedProvider>
  );
  return { onSelect, user: userEvent.setup() };
};

describe('AddressSearch', () => {
  it('lists sorted suggestions and selects the clicked address', async () => {
    const { onSelect, user } = renderSearch([
      successMock([makeAddress('Bstreet'), makeAddress('Astreet')]),
    ]);

    await user.click(screen.getByRole('combobox'));
    await user.paste('str');

    const options = await screen.findAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual([
      'Astreet 1, 00000 Testcity',
      'Bstreet 1, 00000 Testcity',
    ]);

    await user.click(options[1]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ streetName: 'Bstreet' })
    );
  });

  it('does not select when typed text matches no suggestion', async () => {
    const { onSelect, user } = renderSearch([
      successMock([makeAddress('Astreet')]),
    ]);

    await user.click(screen.getByRole('combobox'));
    await user.paste('zzz');
    await screen.findAllByRole('option');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows a dismissible error notification when the query fails', async () => {
    const { user } = renderSearch([
      {
        request: { query: QUERY },
        variableMatcher: () => true,
        error: new Error('Network down'),
      },
    ]);

    await user.click(screen.getByRole('combobox'));
    await user.paste('err');

    expect(await screen.findByText(/Network down/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'message.close' }));

    // The notification is removed after its closing animation
    await waitFor(() =>
      expect(screen.queryByText(/Network down/)).not.toBeInTheDocument()
    );
  });
});
