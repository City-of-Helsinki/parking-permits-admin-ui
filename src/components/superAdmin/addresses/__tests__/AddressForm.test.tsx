import { useLazyQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Address } from '../../../../types';
import AddressForm from '../AddressForm';

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useLazyQuery: vi.fn(),
}));
vi.mock('../../../common/LocationPicker', () => ({
  default: ({
    errorText,
    onChange,
  }: {
    errorText?: string;
    onChange: (value: number[]) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onChange([1, 2])}>
        pick location
      </button>
      {errorText}
    </div>
  ),
}));

const existingAddress = {
  streetName: 'Testikatu',
  streetNameSv: 'Testgatan',
  streetNumber: '1',
  postalCode: '12345',
  city: 'HELSINKI',
  citySv: 'HELSINGFORS',
  location: [3, 4],
  zone: { name: 'A', label: 'Zone A', labelSv: 'Zon A' },
} as unknown as Address;

const renderForm = (address?: Address) => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const onDelete = vi.fn();
  render(
    <AddressForm
      address={address}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDelete={onDelete}
    />
  );
  return { onSubmit, onCancel, onDelete };
};

describe('AddressForm', () => {
  const getZoneByLocation = vi.fn();

  beforeEach(() => {
    vi.mocked(useLazyQuery).mockReturnValue([
      getZoneByLocation,
      { data: undefined, error: undefined, loading: false },
    ] as unknown as ReturnType<typeof useLazyQuery>);
  });

  it('renders empty create form with disabled save and no delete button', () => {
    renderForm();

    expect(screen.getByLabelText('Street name')).toHaveValue('');
    expect(screen.getByLabelText('City')).toHaveValue('HELSINKI');
    expect(screen.getByLabelText('City (sv)')).toHaveValue('HELSINGFORS');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('shows validation errors after blur and keeps save disabled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByLabelText('Street name'));
    await user.click(screen.getByLabelText('Street number'));
    await user.type(screen.getByLabelText('Postal code'), '123');
    await user.tab();

    expect(await screen.findByText('Please enter a street name')).toBeVisible();
    expect(
      await screen.findByText('Postal code should have 5 digits')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('submits the entered values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText('Street name'), 'Testikatu');
    await user.type(screen.getByLabelText('Street number'), '2');
    await user.type(screen.getByLabelText('Postal code'), '12345');
    const save = screen.getByRole('button', { name: 'Save' });
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      streetName: 'Testikatu',
      streetNameSv: '',
      streetNumber: '2',
      postalCode: '12345',
      city: 'HELSINKI',
      citySv: 'HELSINGFORS',
    });
  });

  it('prefills existing address, shows zone, and supports delete and cancel', async () => {
    const user = userEvent.setup();
    const { onDelete, onCancel } = renderForm(existingAddress);

    expect(screen.getByLabelText('Street name')).toHaveValue('Testikatu');
    expect(screen.getByLabelText('Zone')).toHaveValue('Zone A');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('queries the zone and enables save when location changes', async () => {
    const user = userEvent.setup();
    renderForm(existingAddress);

    await user.click(screen.getByRole('button', { name: 'pick location' }));

    expect(getZoneByLocation).toHaveBeenCalledWith({
      variables: { location: [1, 2] },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    );
  });
});
