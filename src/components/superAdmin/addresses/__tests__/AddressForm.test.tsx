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

const T_PATH = 'components.superAdmin.addresses.addressForm';
const label = (key: string) => `${T_PATH}.${key}`;

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

    expect(screen.getByLabelText(label('streetName'))).toHaveValue('');
    expect(screen.getByLabelText(label('city'))).toHaveValue('HELSINKI');
    expect(screen.getByLabelText(label('citySv'))).toHaveValue('HELSINGFORS');
    expect(screen.getByRole('button', { name: label('save') })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: label('delete') })
    ).not.toBeInTheDocument();
  });

  it('shows validation errors after blur and keeps save disabled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByLabelText(label('streetName')));
    await user.click(screen.getByLabelText(label('streetNumber')));
    await user.type(screen.getByLabelText(label('postalCode')), '123');
    await user.tab();

    expect(await screen.findByText(label('enterStreetName'))).toBeVisible();
    expect(await screen.findByText(label('postalCode5Digits'))).toBeVisible();
    expect(screen.getByRole('button', { name: label('save') })).toBeDisabled();
  });

  it('submits the entered values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(label('streetName')), 'Testikatu');
    await user.type(screen.getByLabelText(label('streetNumber')), '2');
    await user.type(screen.getByLabelText(label('postalCode')), '12345');
    const save = screen.getByRole('button', { name: label('save') });
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

    expect(screen.getByLabelText(label('streetName'))).toHaveValue('Testikatu');
    expect(screen.getByLabelText(label('zone'))).toHaveValue('Zone A');
    expect(screen.getByRole('button', { name: label('save') })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: label('delete') }));
    await user.click(screen.getByRole('button', { name: label('cancel') }));
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
      expect(screen.getByRole('button', { name: label('save') })).toBeEnabled()
    );
  });
});
