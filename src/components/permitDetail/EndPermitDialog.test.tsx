import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermitEndType } from '../../types';
import EndPermitDialog from './EndPermitDialog';

const currentPeriodEndTime = '2030-01-15T10:30:00';

const renderDialog = (
  overrides: {
    isOpen?: boolean;
    canEndAfterCurrentPeriod?: boolean;
  } = {}
) => {
  const callbacks = {
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };
  const user = userEvent.setup();

  render(
    <EndPermitDialog
      isOpen
      canEndAfterCurrentPeriod
      currentPeriodEndTime={currentPeriodEndTime}
      {...callbacks}
      {...overrides}
    />
  );

  return { ...callbacks, user };
};

describe('EndPermitDialog', () => {
  it('displays the end options and disables continue until one is selected', () => {
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: 'End permit' })
    ).toBeInTheDocument();
    expect(screen.getByText('15.1.2030 10:30')).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'End permit after current period' })
    ).toBeEnabled();
    expect(
      screen.getByRole('radio', { name: 'End permit immediately' })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it.each([
    {
      label: 'End permit after current period',
      endType: PermitEndType.AFTER_CURRENT_PERIOD,
    },
    {
      label: 'End permit immediately',
      endType: PermitEndType.IMMEDIATELY,
    },
  ])('confirms the selected end type: $label', async ({ label, endType }) => {
    const { onConfirm, user } = renderDialog();

    await user.click(screen.getByRole('radio', { name: label }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onConfirm).toHaveBeenCalledWith(endType);
  });

  it('disables ending after the current period when unavailable', () => {
    renderDialog({
      canEndAfterCurrentPeriod: false,
    });

    expect(
      screen.getByRole('radio', { name: 'End permit after current period' })
    ).toBeDisabled();
    expect(
      screen.getByRole('radio', { name: 'End permit immediately' })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('calls onCancel when canceled', async () => {
    const { onCancel, onConfirm, user } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not display the dialog when closed', () => {
    renderDialog({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
