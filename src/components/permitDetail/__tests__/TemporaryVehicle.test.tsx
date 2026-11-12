import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitDetail } from '../../../types';
import TemporaryVehicle, { combineDateAndTime } from '../TemporaryVehicle';

const T_PATH = 'components.permitDetail.temporaryVehicle';
const permit = {
  id: '1',
  endTime: '2030-12-31T00:00:00Z',
} as unknown as PermitDetail;

// Local-time ISO string without offset, matching combineDateAndTime
const localIso = (dateTime: string) => new Date(dateTime).toISOString();

const renderForm = () => {
  const addTemporaryVehicle = vi.fn();
  const cancelAddTempVehicle = vi.fn();
  render(
    <TemporaryVehicle
      permit={permit}
      addTemporaryVehicle={addTemporaryVehicle}
      cancelAddTempVehicle={cancelAddTempVehicle}
    />
  );
  return { addTemporaryVehicle, cancelAddTempVehicle };
};

describe('TemporaryVehicle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2030-01-10T10:05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders fields with their default values', () => {
    renderForm();

    expect(screen.getByText(`${T_PATH}.title`)).toBeInTheDocument();
    expect(
      screen.getByLabelText(`${T_PATH}.registrationNumber.label`)
    ).toHaveValue('');
    expect(screen.getByLabelText(`${T_PATH}.startDate`)).toHaveValue(
      '10.1.2030'
    );
    expect(screen.getByLabelText(`${T_PATH}.endDate`)).toHaveValue('24.1.2030');
    expect(
      screen.getByRole('button', { name: `${T_PATH}.actionBtn.continue` })
    ).toBeEnabled();
  });

  it('uppercases the registration number and submits the payload', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { addTemporaryVehicle } = renderForm();

    await user.type(
      screen.getByLabelText(`${T_PATH}.registrationNumber.label`),
      'abc123'
    );
    expect(
      screen.getByLabelText(`${T_PATH}.registrationNumber.label`)
    ).toHaveValue('ABC123');

    await user.click(
      screen.getByRole('button', { name: `${T_PATH}.actionBtn.continue` })
    );

    await waitFor(() => expect(addTemporaryVehicle).toHaveBeenCalledTimes(1));
    expect(addTemporaryVehicle).toHaveBeenCalledWith({
      variables: {
        permitId: '1',
        registrationNumber: 'ABC123',
        startTime: localIso('2030-01-10T10:05:00'),
        endTime: localIso('2030-01-24T23:59:00'),
      },
    });
  });

  it('submits an edited end date', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { addTemporaryVehicle } = renderForm();

    fireEvent.change(screen.getByLabelText(`${T_PATH}.endDate`), {
      target: { value: '20.1.2030' },
    });
    await user.click(
      screen.getByRole('button', { name: `${T_PATH}.actionBtn.continue` })
    );

    await waitFor(() => expect(addTemporaryVehicle).toHaveBeenCalledTimes(1));
    expect(addTemporaryVehicle.mock.calls[0][0].variables.endTime).toBe(
      localIso('2030-01-20T23:59:00')
    );
  });

  it('calls cancel handler with false without submitting', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { cancelAddTempVehicle, addTemporaryVehicle } = renderForm();

    await user.click(
      screen.getByRole('button', { name: `${T_PATH}.actionBtn.cancel` })
    );

    expect(cancelAddTempVehicle).toHaveBeenCalledWith(false);
    expect(addTemporaryVehicle).not.toHaveBeenCalled();
  });

  it('combineDateAndTime returns an ISO string for local date and time', () => {
    expect(combineDateAndTime(new Date('2030-06-07T00:00:00'), '08:30')).toBe(
      localIso('2030-06-07T08:30:00')
    );
  });
});
